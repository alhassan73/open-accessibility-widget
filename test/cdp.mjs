// Minimal headless-Chrome driver over the DevTools Protocol (no dependencies; Node >= 22 has WebSocket).
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function findChrome() {
  const env = process.env;
  const candidates = [
    env.CHROME_PATH,
    path.join(env.PROGRAMFILES ?? "", "Google/Chrome/Application/chrome.exe"),
    path.join(env["PROGRAMFILES(X86)"] ?? "", "Google/Chrome/Application/chrome.exe"),
    path.join(env.LOCALAPPDATA ?? "", "Google/Chrome/Application/chrome.exe"),
    path.join(env["PROGRAMFILES(X86)"] ?? "", "Microsoft/Edge/Application/msedge.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const exe = candidates.find((p) => p && fs.existsSync(p));
  if (!exe) throw new Error("Chrome not found; set CHROME_PATH");
  return exe;
}

export async function launchBrowser() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "a11yw-chrome-"));
  const args = [
    "--headless=new", "--remote-debugging-port=0", "--remote-allow-origins=*", "--no-first-run",
    "--no-default-browser-check", "--disable-gpu", "--allow-file-access-from-files", `--user-data-dir=${profile}`,
  ];
  if (process.env.CI) args.push("--no-sandbox");
  const proc = spawn(findChrome(), [...args, "about:blank"]);
  const wsUrl = await new Promise((resolve, reject) => {
    let log = "";
    const timer = setTimeout(() => reject(new Error(`Chrome did not start:\n${log}`)), 20000);
    proc.stderr.on("data", (d) => {
      log += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(log);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
  });

  const ws = new WebSocket(wsUrl);
  await new Promise((r) => (ws.onopen = r));
  let seq = 0;
  const pending = new Map();
  const waiters = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      const { res, rej } = pending.get(m.id);
      pending.delete(m.id);
      m.error ? rej(new Error(m.error.message)) : res(m.result);
    } else {
      for (const w of [...waiters]) {
        if (w.method === m.method && w.sessionId === m.sessionId) {
          waiters.splice(waiters.indexOf(w), 1);
          w.res(m.params);
        }
      }
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((res, rej) => {
      const id = ++seq;
      pending.set(id, { res, rej });
      ws.send(JSON.stringify({ id, method, params, sessionId }));
    });
  const waitFor = (method, sessionId, ms = 15000) =>
    new Promise((res, rej) => {
      waiters.push({ method, sessionId, res });
      setTimeout(() => rej(new Error(`timeout waiting for ${method}`)), ms);
    });

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId: S } = await send("Target.attachToTarget", { targetId, flatten: true });
  for (const domain of ["Page", "Runtime", "DOM", "Accessibility"]) await send(`${domain}.enable`, {}, S);

  const page = {
    send: (method, params) => send(method, params, S),
    async eval(expression) {
      const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }, S);
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      return r.result.value;
    },
    async goto(url) {
      await send("Emulation.setEmulatedMedia", { features: [] }, S);
      await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, S);
      const loaded = waitFor("Page.loadEventFired", S);
      await send("Page.navigate", { url }, S);
      await loaded;
      await page.eval(`
        window.__d = (el) => el ? el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
          (typeof el.className === 'string' && el.className ? '.' + el.className.split(' ')[0] : '') : null;
        window.__w = () => A11yWidget.getAccessibilityWidget();
        try { localStorage.clear(); } catch {}
        1`);
    },
    /** Trusted key press. `key` is [key, code, keyCode, text?]. */
    async press(key, modifiers = 0) {
      const [k, code, vk, text] = key;
      const base = { key: k, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk, modifiers };
      await send("Input.dispatchKeyEvent", { ...base, type: text ? "keyDown" : "rawKeyDown", text, unmodifiedText: text }, S);
      await send("Input.dispatchKeyEvent", { ...base, type: "keyUp" }, S);
      await sleep(30);
    },
    /** Trusted mouse click in the middle of the element. */
    async click(selector) {
      const { x, y } = await page.eval(
        `(() => { const r = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })()`
      );
      for (const type of ["mousePressed", "mouseReleased"]) {
        await send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1 }, S);
      }
      await sleep(50);
    },
    /** Accessible role and name of the first element matching `selector`. */
    async ax(selector) {
      const { root } = await send("DOM.getDocument", { depth: 0 }, S);
      const { nodeId } = await send("DOM.querySelector", { nodeId: root.nodeId, selector }, S);
      if (!nodeId) return null;
      const { nodes } = await send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false }, S);
      return { role: nodes[0].role?.value, name: nodes[0].name?.value ?? "" };
    },
  };

  return {
    page,
    async close() {
      ws.close();
      proc.kill();
      await sleep(300);
      fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
    },
  };
}

/** Write an HTML fixture that loads the built `<script>` bundle; returns its file:// URL. */
export function fixture(dir, name, { head = "", body = "" } = {}) {
  const bundle = pathToFileURL(path.resolve("dist/open-accessibility-widget.global.js")).href;
  const file = path.join(dir, `${name}.html`);
  fs.writeFileSync(
    file,
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${name}</title>${head}<script src="${bundle}"></script></head><body>${body}</body></html>`
  );
  return pathToFileURL(file).href;
}

export const KEYS = {
  Tab: ["Tab", "Tab", 9],
  Enter: ["Enter", "Enter", 13, "\r"],
  Escape: ["Escape", "Escape", 27],
  ArrowRight: ["ArrowRight", "ArrowRight", 39],
};
export const MOD = { alt: 1, ctrl: 2, meta: 4, shift: 8 };
export { sleep };
