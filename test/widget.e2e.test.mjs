// End-to-end tests in headless Chrome against the built <script> bundle (run `npm run build` first).
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { pathToFileURL } from "node:url";
import { fixture, KEYS, launchBrowser, MOD, sleep } from "./cdp.mjs";

const SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='red'/%3E%3C/svg%3E";
const HOST = `
<style>
  .toggle[aria-pressed=true]{background:#0a7d00;color:#fff;border:0;padding:6px}
  .bs-check{appearance:none;width:20px;height:20px;border:1px solid #888;background:#fff no-repeat center/contain}
  .bs-check:checked{background-color:#0d6efd;background-image:url("${SVG}")}
  #anim{transition:opacity .2s;background-image:linear-gradient(#fff,#ddd)}
  #playbtn{position:absolute;top:10px;right:10px}
  #lnk{background-image:linear-gradient(#fff,#fff)}
</style>
<header><h1>Site title</h1><nav><a id="a" href="#a">Link A</a> <a id="b" href="#b">Link B</a></nav></header>
<main id="main">
  <h2>Section heading</h2>
  <p>Paragraph with an <a href="#c" id="lnk">inline link</a> inside it.</p>
  <button id="btn" class="toggle" aria-pressed="true">Custom toggle</button>
  <input type="checkbox" id="cb" class="bs-check" checked><label for="cb">Bootstrap-style check</label>
  <form onsubmit="return false"><input type="image" id="imgsubmit" src="${SVG}" alt="Search"></form>
  <a href="#x" id="iconlink"><img id="iconimg" src="${SVG}" alt="Home"></a>
  <textarea id="ta" aria-label="Notes"></textarea>
  <video id="vid"></video>
  <button id="playbtn" onclick="vid.muted=false;vid.play().catch(()=>{});setTimeout(()=>window.__muted=vid.muted,150)">Play with sound</button>
  <div id="anim">Animated box</div>
  <table><tr><th>Header cell</th><td>Table cell text</td></tr></table>
  <div>Div-only text content</div>
</main>
<footer><p>Footer text</p></footer>`;

let browser, page, dir, HOST_URL, BLANK_URL, TT_URL;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "a11yw-fixtures-"));
  HOST_URL = fixture(dir, "host", { body: HOST });
  BLANK_URL = fixture(dir, "blank");
  // The strict policy documented in the README: Trusted Types, nonce-only styles, data: images.
  TT_URL = fixture(dir, "tt", {
    head: `<meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'; default-src 'none'; script-src file:; style-src 'nonce-t3st'; img-src data:">`,
  });
  browser = await launchBrowser();
  page = browser.page;
});

after(async () => {
  await browser?.close();
  fs.rmSync(dir, { recursive: true, force: true });
});

const init = (options = "{}") => page.eval(`A11yWidget.init(${options}); 1`);
const openPanelAllSections = () =>
  page.eval(`__w().open(); document.querySelectorAll('.a11yw-acc-btn[aria-expanded=false]').forEach((b) => b.click()); 1`);

test("keyboard: skip link, open, focus trap, arrow keys, Escape", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.press(KEYS.Tab);
  assert.equal(await page.eval(`__d(document.activeElement)`), "a.a11yw-skip");
  await page.press(KEYS.Tab);
  assert.equal(await page.eval(`__d(document.activeElement)`), "button.a11yw-launcher");
  await page.press(KEYS.Enter);
  assert.equal(await page.eval(`__w().getState().isOpen`), true);
  assert.equal(await page.eval(`__d(document.activeElement)`), "button.a11yw-icon-btn");
  for (let i = 0; i < 40; i++) await page.press(KEYS.Tab);
  assert.equal(await page.eval(`document.querySelector('.a11yw-panel').contains(document.activeElement)`), true);
  await page.eval(`document.querySelector('.a11yw-seg [aria-checked=true]').focus(); 1`);
  await page.press(KEYS.ArrowRight);
  assert.equal(await page.eval(`__w().getSettings().textAlign`), "left");
  await page.press(KEYS.Escape);
  assert.equal(await page.eval(`__w().getState().isOpen`), false);
  assert.equal(await page.eval(`__d(document.activeElement)`), "button.a11yw-launcher");
});

test("open dialogs make the page behind them inert, and restore it", async () => {
  await page.goto(HOST_URL);
  await page.eval(`document.querySelector('footer').inert = true; 1`);
  await init();
  const inert = () => page.eval(`['header', 'main', 'footer', '.a11yw-root', '.a11yw-launcher'].map((s) => document.querySelector(s).inert)`);
  await page.eval(`__w().open(); 1`);
  assert.deepEqual(await inert(), [true, true, true, false, false]);
  await page.click("#playbtn");
  assert.equal(await page.eval(`__w().getState().isOpen`), false, "a click outside still closes the panel");
  assert.deepEqual(await inert(), [false, false, true, false, false], "the page's own inert is kept");
  await page.eval(`__w().open(); document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  assert.deepEqual(await inert(), [true, true, true, false, true]);
  await page.press(KEYS.Escape);
  assert.deepEqual(await inert(), [false, false, true, false, false]);
  assert.equal(await page.eval(`__d(document.activeElement)`), "button.a11yw-launcher");
  assert.equal(await page.eval(`document.querySelector('.a11yw-skip').inert`), false);

  // Content added while open is inert too; inert the page sets meanwhile is kept on close.
  await page.eval(`__w().open(); const t = document.createElement('div'); t.id = 'toast'; document.body.append(t); 1`);
  await sleep(50);
  assert.equal(await page.eval(`toast.inert`), true, "content added while open");
  await page.eval(`document.querySelector('header').inert = true; 1`);
  await page.eval(`__w().setOptions({ language: 'ar' }); 1`); // rebuilds the panel while open
  await sleep(50);
  assert.deepEqual([await page.eval(`__w().getState().isOpen`), ...(await inert())], [true, true, true, true, false, false]);
  await page.eval(`__w().close(); 1`);
  assert.deepEqual(await inert(), [true, false, true, false, false], "the page's own inert, set while open, is kept");
  assert.equal(await page.eval(`toast.inert`), false);

  await page.eval(`__w().open(); __w().destroy(); 1`);
  assert.deepEqual(await page.eval(`['main', 'footer'].map((s) => document.querySelector(s).inert)`), [false, true]);
});

test("axe-core: no violations in the panel or read mode", async () => {
  // From devDependencies, so it always runs (offline too) and a missing copy fails instead of skipping.
  const axe = fs.readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
  await page.goto(HOST_URL);
  await init();
  await openPanelAllSections();
  await sleep(300);
  await page.eval(`${axe}; 1`);
  const run = () =>
    page.eval(`axe.run({ include: [['.a11yw-root']] }).then((r) => r.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target).join(' | ')))`);
  assert.deepEqual(await run(), []);
  assert.deepEqual(await page.ax(".a11yw-profile"), { role: "button", name: "Motion sensitivity Stops animations and softens colors" });
  await page.click(".a11yw-lang"); // the custom language list, open
  await sleep(300);
  assert.deepEqual(await run(), []);
  await page.press(KEYS.Escape);
  await page.eval(`document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  await sleep(100);
  assert.deepEqual(await run(), []);
});

test("language menu: custom listbox with keyboard, Escape and pointer", async () => {
  const ArrowDown = ["ArrowDown", "ArrowDown", 40];
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().open(); document.querySelector('.a11yw-lang').focus(); 1`);
  const state = () => page.eval(`(() => { const b = document.querySelector('.a11yw-lang'), a = b.getAttribute('aria-activedescendant');
    return { expanded: b.getAttribute('aria-expanded'), list: !document.getElementById(b.getAttribute('aria-controls')).hidden,
      active: a && document.getElementById(a).textContent, lang: document.querySelector('.a11yw-widget').lang }; })()`);
  assert.deepEqual(await page.ax(".a11yw-lang"), { role: "combobox", name: "Language" });
  await page.press(ArrowDown);
  assert.deepEqual(await state(), { expanded: "true", list: true, active: "English", lang: "en" }, "opens on the current language");
  await page.press(ArrowDown);
  assert.deepEqual(await state(), { expanded: "true", list: true, active: "العربية", lang: "en" }, "arrowing never switches the language");
  await page.press(KEYS.Escape);
  assert.deepEqual(await state(), { expanded: "false", list: false, active: null, lang: "en" });
  assert.equal(await page.eval(`__w().getState().isOpen`), true, "Escape closes only the list");
  await page.press(ArrowDown);
  await page.press(ArrowDown);
  await page.press(KEYS.Enter);
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-widget').lang`), "ar");
  assert.equal(await page.eval(`document.activeElement.classList.contains('a11yw-lang')`), true, "focus stays on the menu");
  await page.click(".a11yw-lang");
  await sleep(50);
  await page.click(".a11yw-lang-list [lang=en]");
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-widget').lang`), "en", "a click picks a language");

  await page.eval(`document.querySelector('.a11yw-lang').focus(); 1`);
  await page.press(["ا", "KeyH", 72, "ا"]); // type-ahead opens the list on the matching language
  assert.deepEqual(await state(), { expanded: "true", list: true, active: "العربية", lang: "en" });
  await page.press(KEYS.Tab);
  assert.deepEqual(await state(), { expanded: "false", list: false, active: null, lang: "en" }, "Tab closes without choosing");
  // Icon only on screen; the current language is still the combobox's value and its tooltip.
  assert.deepEqual(await page.eval(`(() => { const b = document.querySelector('.a11yw-lang'), v = b.querySelector('.a11yw-lang-value');
    return [b.title, v.textContent, v.lang, getComputedStyle(v).position, b.offsetWidth]; })()`), ["English", "English", "en", "absolute", 34]);
});

test("does not change the page layout (grid body)", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<style>body{display:grid;grid-template-rows:auto 1fr auto;min-height:100vh;margin:0}header,footer{height:60px}</style><header>H</header><main id="m">M</main><footer>F</footer>'; 1`);
  const rect = `(() => { const r = document.getElementById('m').getBoundingClientRect(); return [r.top, r.height]; })()`;
  const before = await page.eval(rect);
  await init();
  await page.eval(`__w().setSettings({ readingGuide: true }); 1`);
  assert.deepEqual(await page.eval(rect), before);
});

test("highlight links keeps the focus indicator distinct", async () => {
  await page.goto(HOST_URL);
  await init(`{ showSkipLink: false }`);
  await page.eval(`__w().setSettings({ highlightLinks: true }); document.getElementById('a').focus(); 1`);
  await page.press(KEYS.Tab);
  const outline = (sel) => page.eval(`(() => { const c = getComputedStyle(${sel}); return c.outlineStyle + ' ' + c.outlineColor; })()`);
  assert.equal(await page.eval(`document.activeElement.id`), "b");
  assert.notEqual(await outline("document.activeElement"), await outline("document.getElementById('a')"));
});

test("mute media keeps sound the visitor starts themselves", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ muteSounds: true }); 1`);
  assert.equal(await page.eval(`vid.muted`), true, "existing media is muted");
  await page.click("#playbtn");
  await sleep(250);
  assert.equal(await page.eval(`window.__muted`), false);
});

test("shortcut never swallows typed characters (macOS Option+A = å)", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`ta.focus(); 1`);
  await page.press(["å", "KeyA", 65, "å"], MOD.alt);
  assert.equal(await page.eval(`ta.value`), "å");
  assert.equal(await page.eval(`__w().getState().isOpen`), false);
  await page.eval(`document.body.focus(); ta.blur(); 1`);
  await page.press(["a", "KeyA", 65, "a"], MOD.alt);
  assert.equal(await page.eval(`__w().getState().isOpen`), true, "Alt+A still opens the panel");
});

test("aria-keyshortcuts is normalized", async () => {
  await page.goto(HOST_URL);
  await init(`{ shortcut: "ctrl+shift+k" }`);
  assert.equal(await page.eval(`document.querySelector('.a11yw-launcher').getAttribute('aria-keyshortcuts')`), "Control+Shift+K");
});

test("reading mask follows keyboard focus and stays below the panel", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ readingMask: true }); 1`);
  await sleep(50);
  const mask = `document.querySelector('.a11yw-mask').style.transform`;
  const start = await page.eval(mask);
  await page.eval(`document.getElementById('lnk').focus(); 1`);
  await sleep(50);
  assert.notEqual(await page.eval(mask), start);
  const z = await page.eval(`[getComputedStyle(document.querySelector('.a11yw-mask')).zIndex, getComputedStyle(document.querySelector('.a11yw-panel')).zIndex].map(Number)`);
  assert.ok(z[0] < z[1], `mask z ${z[0]} must be below panel z ${z[1]}`);
});

test("selected option has a visible, high-contrast state", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().open(); 1`);
  const [track, selected] = await page.eval(`(() => { const s = document.querySelector('.a11yw-seg'); return [getComputedStyle(s).backgroundColor, getComputedStyle(s.querySelector('[aria-checked=true]')).backgroundColor]; })()`);
  assert.notEqual(selected, track);
  assert.equal(selected, "rgb(15, 118, 110)");
});

test("hide images keeps controls named, visible and usable", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ hideImages: true }); 1`);
  assert.deepEqual(await page.ax("#iconlink"), { role: "link", name: "Home" });
  assert.equal(await page.eval(`getComputedStyle(imgsubmit).visibility + getComputedStyle(imgsubmit).opacity`), "visible1");
  assert.match(await page.eval(`getComputedStyle(cb).backgroundImage`), /^url/);
  assert.equal(await page.eval(`getComputedStyle(document.querySelector('main p')).opacity`), "1");
});

test("dark mode keeps selected states and uses a dark color scheme", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ colorMode: 'dark-contrast' }); 1`);
  assert.equal(await page.eval(`getComputedStyle(document.documentElement).colorScheme`), "dark");
  assert.match(await page.eval(`getComputedStyle(btn).boxShadow`), /inset/);
  assert.equal(await page.eval(`getComputedStyle(anim).backgroundImage`), "none", "text never stays on a background image");
  assert.match(await page.eval(`getComputedStyle(cb).backgroundImage`), /^url/, "form controls keep their state images");
  assert.match(await page.eval(`getComputedStyle(lnk).backgroundImage`), /gradient/, "links keep their icons");
});

test("stop animations still fires transitionend", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ stopAnimations: true }); 1`);
  const fired = await page.eval(`new Promise((res) => { let ok = false; anim.addEventListener('transitionend', () => (ok = true), { once: true }); getComputedStyle(anim).opacity; anim.style.opacity = '0.5'; setTimeout(() => res(ok), 300); })`);
  assert.equal(fired, true);
});

test("hostile or careless API use fails safely", async () => {
  await page.goto(HOST_URL);
  const out = await page.eval(`(() => {
    const out = {};
    const w = A11yWidget.init();
    w.toggleProfile('bogus'); w.toggleProfile('bogus');
    out.profiles = w.getSettings().profiles;
    for (let i = 0; i < 5; i++) A11yWidget.init();
    out.roots = document.querySelectorAll('.a11yw-root').length;
    A11yWidget.init({ offset: { x: -999, y: -999 }, buttonSize: 0, zIndex: NaN });
    const r = document.querySelector('.a11yw-launcher').getBoundingClientRect();
    out.launcherOnScreen = r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight && r.width >= 24;
    const w2 = __w();
    w2.setSettings({ fontSize: -999, colorMode: 'evil', textColor: 'red;}' });
    out.sanitized = [w2.getSettings().fontSize, w2.getSettings().colorMode, w2.getSettings().textColor];
    out.frozen = Object.isFrozen(w2.getSettings());
    const w3 = A11yWidget.init({ onChange() { throw new Error('consumer bug'); } });
    const realError = console.error; console.error = () => {};
    try { w3.setSettings({ readableFont: true }); out.onChangeThrow = 'contained'; } catch { out.onChangeThrow = 'propagated'; }
    console.error = realError;
    out.switchInSync = document.querySelectorAll('[role=switch]')[0].getAttribute('aria-checked');
    localStorage.setItem('a11yw-settings', '{not json'); A11yWidget.init(); out.corruptStorage = 'ok';
    w3.destroy();
    return out;
  })()`);
  assert.deepEqual(out, {
    profiles: [],
    roots: 1,
    launcherOnScreen: true,
    sanitized: [50, "default", null],
    frozen: true,
    onChangeThrow: "contained",
    switchInSync: "true",
    corruptStorage: "ok",
  });
});

test("setSettings({ profiles }) applies the profile presets", async () => {
  await page.goto(HOST_URL);
  await init();
  const s = await page.eval(`(__w().setSettings({ profiles: ['visionImpaired'] }), __w().getSettings())`);
  assert.deepEqual([s.profiles, s.fontSize, s.readableFont], [["visionImpaired"], 120, true]);
  const off = await page.eval(`(__w().setSettings({ fontSize: 150 }), __w().toggleProfile('visionImpaired'), __w().getSettings())`);
  assert.equal(off.fontSize, 150, "turning a profile off keeps the visitor's own change");
  assert.equal(off.readableFont, false);
});

test("features and initialSettings options", async () => {
  await page.goto(HOST_URL);
  await init(`{ features: { hideImages: false, readMode: false, pageStructure: false }, initialSettings: { fontSize: 130 } }`);
  const out = await page.eval(`(() => {
    __w().setSettings({ hideImages: true });
    const labels = [...document.querySelectorAll('.a11yw-row-label')].map((e) => e.textContent);
    return { hideImages: __w().getSettings().hideImages, fontSize: __w().getSettings().fontSize,
      hasHideRow: labels.includes('Hide images'), dialogs: document.querySelectorAll('.a11yw-row[aria-haspopup]').length };
  })()`);
  assert.deepEqual(out, { hideImages: false, fontSize: 130, hasHideRow: false, dialogs: 0 });
});

test("works under a strict Trusted Types CSP without violations", async () => {
  await page.goto(TT_URL);
  const out = await page.eval(`new Promise((res) => {
    const violations = [];
    document.addEventListener('securitypolicyviolation', (e) => violations.push(e.violatedDirective + ' ' + e.blockedURI));
    A11yWidget.init({ nonce: 't3st' });
    __w().open();
    __w().setSettings({ fontSize: 150, readingGuide: true, cursor: 'black', colorMode: 'dark-contrast', saturationMode: 'monochrome' });
    document.querySelector('.a11yw-row[aria-haspopup]').click();
    setTimeout(() => res({ icons: document.querySelectorAll('.a11yw-root svg path').length > 0,
      styled: getComputedStyle(document.querySelector('.a11yw-launcher')).position, violations }), 300);
  })`);
  assert.deepEqual(out, { icons: true, styled: "fixed", violations: [] });
});

test("the widget's own motion follows prefers-reduced-motion", async () => {
  await page.goto(HOST_URL);
  await page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await init();
  await page.eval(`__w().open(); 1`);
  const out = await page.eval(`['.a11yw-panel', '.a11yw-launcher', '.a11yw-switch'].map((s) => getComputedStyle(document.querySelector(s)).transitionDuration)`);
  assert.deepEqual(out, ["0s", "0s", "0s"]);
  assert.equal(await page.eval(`document.querySelector('.a11yw-panel').hidden`), false, "opens at once");
});

test("survives frameworks resetting <html class> and swapping <body>", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ highlightLinks: true, fontSize: 150 }); document.documentElement.className = 'app-theme'; 1`);
  await sleep(50);
  assert.equal(await page.eval(`document.documentElement.classList.contains('a11yw-links')`), true);
  await page.eval(`const b = document.createElement('body'); b.innerHTML = '<main><p id="np">New page</p></main>'; document.body.replaceWith(b); 1`);
  await sleep(150);
  assert.equal(await page.eval(`!!document.querySelector('.a11yw-root')`), true);
  assert.equal(await page.eval(`np.hasAttribute('data-a11yw-fs')`), true);
  await page.eval(`document.body.innerHTML = '<main><p>htmx swap</p></main>'; 1`);
  await sleep(150);
  assert.equal(await page.eval(`!!document.querySelector('.a11yw-root')`), true);
});

test("read mode keeps page language, tables, div text and links", async () => {
  await page.goto(HOST_URL);
  await init(`{ language: 'ar' }`);
  await page.eval(`__w().open(); 1`);
  await sleep(250);
  await page.eval(`document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  const out = await page.eval(`(() => { const b = document.querySelector('.a11yw-reader-body'), t = b.textContent;
    return { title: document.querySelector('.a11yw-reader h2').textContent, lang: b.closest('[lang]').lang, dir: getComputedStyle(b).direction,
      table: t.includes('Table cell text'), div: t.includes('Div-only text'), links: b.querySelectorAll('a[href]').length > 0, image: t.includes('Home') }; })()`);
  assert.deepEqual(out, { title: "وضع القراءة", lang: "en", dir: "ltr", table: true, div: true, links: true, image: true });
});

test("skip link: only with a target, prefers <main>, leaves no tabindex", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<nav><a href="/x">Nav</a></nav><div>No main</div>'; 1`);
  await init();
  assert.equal(await page.eval(`!!document.querySelector('.a11yw-skip')`), false);

  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<a href="#content">Skip</a><main id="content">Main</main>'; 1`);
  await init();
  assert.equal(await page.eval(`!!document.querySelector('.a11yw-skip')`), false, "the page already has a skip link");

  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<header><h1>Logo</h1></header><main><p>Main</p></main><button id="x">x</button>'; 1`);
  await init();
  await page.press(KEYS.Tab);
  await page.press(KEYS.Enter);
  assert.equal(await page.eval(`__d(document.activeElement)`), "main");
  await page.eval(`x.focus(); 1`);
  assert.equal(await page.eval(`document.querySelector('main').hasAttribute('tabindex')`), false);
});

test("font scaling: no inline styles, no re-measure on height-only resize", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ fontSize: 150 }); 1`);
  const out = await page.eval(`new Promise((res) => { let n = 0; const mo = new MutationObserver((r) => (n += r.length));
    mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['data-a11yw-fs'] });
    dispatchEvent(new Event('resize'));
    setTimeout(() => { mo.disconnect(); res({ mutations: n, inlineStyles: document.querySelectorAll('[data-a11yw-fs][style]').length,
      scaled: getComputedStyle(document.querySelector('main p')).fontSize }); }, 400); })`);
  assert.deepEqual(out, { mutations: 0, inlineStyles: 0, scaled: "24px" });
});

test("color filters are off in forced-colors mode", async () => {
  await page.goto(HOST_URL);
  await page.send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value: "active" }] });
  await init();
  await page.eval(`__w().setSettings({ saturationMode: 'monochrome', colorMode: 'high-contrast' }); 1`);
  assert.equal(await page.eval(`getComputedStyle(document.querySelector('.a11yw-backdrop')).display`), "none");
});

test("reflow: panel fits a 320px-wide viewport without horizontal scrolling", async () => {
  await page.goto(HOST_URL);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 256, deviceScaleFactor: 1, mobile: false });
  await init();
  await page.eval(`__w().open(); 1`);
  await sleep(350);
  const out = await page.eval(`(() => { const p = document.querySelector('.a11yw-panel').getBoundingClientRect();
    return { fits: p.top >= 0 && p.bottom <= innerHeight + 1 && p.right <= innerWidth + 1, hScroll: document.documentElement.scrollWidth > innerWidth }; })()`);
  assert.deepEqual(out, { fits: true, hScroll: false });
});

test("reflow: read mode fits a 320px-wide viewport; widget focus is visible", async () => {
  await page.goto(HOST_URL);
  await page.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 256, deviceScaleFactor: 1, mobile: false });
  await init();
  await page.press(KEYS.Tab);
  await page.press(KEYS.Tab);
  assert.match(await page.eval(`(() => { const c = getComputedStyle(document.activeElement); return c.outlineStyle + ' ' + c.outlineWidth; })()`), /^solid 3px$/);
  await page.eval(`__w().open(); document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  await sleep(100);
  const out = await page.eval(`(() => { const r = document.querySelector('.a11yw-reader').getBoundingClientRect();
    return { fits: r.left >= 0 && r.right <= innerWidth + 1, hScroll: document.documentElement.scrollWidth > innerWidth,
      focus: document.activeElement.getAttribute('aria-label') }; })()`);
  assert.deepEqual(out, { fits: true, hScroll: false, focus: "Close read mode" });
});

test("the widget itself is never changed by its own adjustments", async () => {
  await page.goto(HOST_URL);
  // A statement link guarantees an `.a11yw-link` (the "Hide widget" link only appears with a fine pointer).
  await init(`{ statementUrl: '#main' }`);
  await openPanelAllSections();
  await sleep(300);
  const snapshot = `(() => {
    const props = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'wordSpacing', 'textAlign', 'color',
      'backgroundColor', 'backgroundImage', 'borderColor', 'outlineStyle', 'cursor', 'colorScheme', 'transitionDuration',
      'opacity', 'visibility', 'zoom', 'filter', 'textDecorationLine'];
    const els = ['.a11yw-panel', '.a11yw-header', '.a11yw-title', '.a11yw-profile', '.a11yw-profile-label', '.a11yw-profile-desc',
      '.a11yw-acc-btn', '.a11yw-row', '.a11yw-row-label', '.a11yw-field-label', '.a11yw-step-value', '.a11yw-step-btn',
      '.a11yw-btn', '.a11yw-link', '.a11yw-launcher', '.a11yw-launcher svg', '.a11yw-badge'];
    const out = {};
    for (const sel of els) { const c = getComputedStyle(document.querySelector(sel)); out[sel] = props.map((p) => p + '=' + c[p]).join('; '); }
    const filters = [];
    for (let el = document.querySelector('.a11yw-panel'); el; el = el.parentElement) {
      const f = getComputedStyle(el).filter;
      if (f !== 'none') filters.push(el.tagName + ' ' + f);
    }
    out.ancestorFilters = filters.join(', ');
    return out;
  })()`;
  const before = await page.eval(snapshot);
  await page.eval(`__w().setSettings({ fontSize: 200, contentScale: 150, lineHeight: 200, letterSpacing: 200, textAlign: 'center',
    readableFont: true, boldText: true, invertColors: true, highlightTitles: true, highlightLinks: true, highlightHover: true, highlightFocus: true,
    colorMode: 'dark-contrast', saturationMode: 'monochrome', textColor: '#ff0000', titleColor: '#00ff00', backgroundColor: '#0000ff',
    hideImages: true, stopAnimations: true, cursor: 'black' }); 1`);
  await sleep(300);
  assert.deepEqual(await page.eval(snapshot), before);
});

test("color filters recolor the page through a layer below the widget", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ saturationMode: 'monochrome', colorMode: 'high-contrast' }); 1`);
  const out = await page.eval(`(() => { const b = document.querySelector('.a11yw-backdrop'), c = getComputedStyle(b);
    return { filter: c.backdropFilter, display: c.display, below: Number(c.zIndex) < Number(getComputedStyle(document.querySelector('.a11yw-launcher')).zIndex),
      htmlFilter: getComputedStyle(document.documentElement).filter }; })()`);
  assert.deepEqual(out, { filter: "contrast(1.4) grayscale(1)", display: "block", below: true, htmlFilter: "none" });
});

test("stepper announces the new value with its name", async () => {
  await page.goto(HOST_URL);
  await init();
  await openPanelAllSections();
  await page.eval(`document.querySelector('.a11yw-step-btn[aria-label="Increase Text size"]').click(); 1`);
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-root [role=status]').textContent`), "Text size 110%");
  assert.equal(await page.eval(`document.querySelector('.a11yw-step-btn').getAttribute('aria-describedby') !== null`), true);
  await page.eval(`__w().setSettings({ fontSize: 200 }); document.querySelector('.a11yw-step-btn[aria-label="Increase Text size"]').click(); 1`);
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-root [role=status]').textContent`), "Text size 200%, maximum");
  await page.eval(`__w().setSettings({ fontSize: 60 }); document.querySelector('.a11yw-step-btn[aria-label="Decrease Text size"]').click(); 1`);
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-root [role=status]').textContent`), "Text size 50%, minimum");
});

test("read mode leaves out lang when the page has none", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.documentElement.removeAttribute('lang'); document.body.innerHTML = '<main><p>Text</p></main>'; 1`);
  await init();
  await page.eval(`__w().open(); document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  assert.equal(await page.eval(`document.querySelector('.a11yw-reader-body').hasAttribute('lang')`), false);
});

test("custom colors with low contrast show a warning", async () => {
  await page.goto(HOST_URL);
  await init();
  await openPanelAllSections();
  const note = `(() => { const n = document.querySelector('.a11yw-note'); return n.hidden ? null : n.textContent; })()`;
  assert.equal(await page.eval(note), null);
  await page.eval(`__w().setSettings({ textColor: '#999999', backgroundColor: '#ffffff' }); 1`);
  assert.equal(await page.eval(note), "Low contrast (2.8:1): text may be hard to read.");
  assert.equal(await page.eval(`document.querySelector('.a11yw-row input[type=color]').getAttribute('aria-describedby') === document.querySelector('.a11yw-note').id`), true);
  await page.eval(`__w().setSettings({ textColor: '#000000' }); 1`);
  assert.equal(await page.eval(note), null);
  await page.eval(`__w().setSettings({ backgroundColor: null, colorMode: 'dark-contrast', titleColor: '#333333' }); 1`);
  assert.match(await page.eval(note), /^Low contrast \(1\.\d:1\)/, "dark mode background counts");
});

test("settings follow changes made in another tab", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`dispatchEvent(new StorageEvent('storage', { key: 'a11yw-settings', newValue: JSON.stringify({ v: 1, highlightLinks: true }) })); 1`);
  assert.equal(await page.eval(`__w().getSettings().highlightLinks`), true);
});

test("destroy() restores the page", async () => {
  await page.goto(HOST_URL);
  await init();
  const out = await page.eval(`(() => {
    __w().setSettings({ fontSize: 150, highlightLinks: true, letterSpacing: 120, readingGuide: true, colorMode: 'dark-contrast', saturationMode: 'monochrome' });
    __w().destroy();
    return { classes: [...document.documentElement.classList].filter((c) => c.startsWith('a11yw')), style: document.documentElement.getAttribute('style'),
      attrs: document.querySelectorAll('[data-a11yw-fs]').length, nodes: document.querySelectorAll('.a11yw-root,.a11yw-layer,.a11yw-backdrop,#a11yw-styles,#a11yw-font-sizes').length };
  })()`);
  assert.deepEqual(out, { classes: [], style: null, attrs: 0, nodes: 0 });
});

test("the launcher steps aside for a focused control under it (WCAG 2.4.11)", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<button id="corner" style="position:fixed;left:30px;bottom:30px">Corner</button><button id="free">Free</button>'; 1`);
  await init();
  const state = `(() => { const l = document.querySelector('.a11yw-launcher');
    return { focused: __d(document.activeElement), yields: l.hasAttribute('data-yield'), clicks: getComputedStyle(l).pointerEvents }; })()`;
  for (let i = 0; i < 5 && (await page.eval(`document.activeElement.id`)) !== "corner"; i++) await page.press(KEYS.Tab);
  await sleep(50);
  assert.deepEqual(await page.eval(state), { focused: "button#corner", yields: true, clicks: "none" });
  // Still in the tab order, and shown again once it has focus itself.
  await page.press(KEYS.Tab, MOD.shift);
  await sleep(50);
  assert.deepEqual(await page.eval(state), { focused: "button.a11yw-launcher", yields: false, clicks: "auto" });
  await page.eval(`document.getElementById('free').focus(); 1`);
  await sleep(50);
  assert.equal(await page.eval(`document.querySelector('.a11yw-launcher').hasAttribute('data-yield')`), false);
  // A control the browser scrolls into view at the bottom edge, under the launcher.
  await page.eval(`document.body.insertAdjacentHTML('beforeend', '<div style="height:3000px"></div><button id="low">Low</button>'); 1`);
  for (let i = 0; i < 6 && (await page.eval(`document.activeElement.id`)) !== "low"; i++) await page.press(KEYS.Tab);
  await sleep(50);
  assert.deepEqual(await page.eval(state), { focused: "button#low", yields: true, clicks: "none" });
});

test("stop animations stops script and SVG animations, and resumes only the ones it paused", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<div id="spin">Spin</div><div id="own">Own</div><div id="fade">Fade</div><svg id="pulse" width="10" height="10"><circle r="5"><animate attributeName="r" values="1;5" dur="1s" repeatCount="indefinite"/></circle></svg>';
    window.spinAnim = spin.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, iterations: Infinity });
    window.ownAnim = own.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, iterations: Infinity }); ownAnim.pause();
    window.fadeAnim = fade.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 60000, fill: 'forwards' });
    fadeAnim.finished.then(() => (window.fadeDone = true)); 1`);
  await init();
  const state = `[spinAnim.playState, ownAnim.playState, pulse.animationsPaused()]`;
  await page.eval(`__w().setSettings({ stopAnimations: true }); 1`);
  assert.deepEqual(await page.eval(state), ["paused", "paused", true]);
  // A finite animation (a fade-in) jumps to its end instead of freezing half-way.
  assert.deepEqual(await page.eval(`Promise.resolve().then(() => [fadeAnim.playState, getComputedStyle(fade).opacity, window.fadeDone === true])`), ["finished", "1", true]);
  // Started after the setting was switched on: caught by the next sweep.
  await page.eval(`window.lateAnim = spin.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, iterations: Infinity }); 1`);
  await sleep(1200);
  assert.equal(await page.eval(`lateAnim.playState`), "paused");
  await page.eval(`__w().setSettings({ stopAnimations: false }); 1`);
  assert.deepEqual(await page.eval(state), ["running", "paused", false], "the page's own paused animation stays paused");
});

test("reading aids follow a tap on touch screens", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ readingGuide: true, textMagnifier: true }); 1`);
  await sleep(50);
  const guide = `document.querySelector('.a11yw-guide').style.transform`;
  const start = await page.eval(guide);
  const { x, y } = await page.eval(`(() => { const r = document.getElementById('lnk').getBoundingClientRect(); return { x: r.left + 5, y: r.top + r.height / 2 }; })()`);
  await page.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  await page.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await sleep(100);
  assert.notEqual(await page.eval(guide), start);
  assert.equal(await page.eval(`(() => { const m = document.querySelector('.a11yw-magnifier'); return m.hidden ? null : m.textContent; })()`), "inline link");
});

test("adjustments reach open shadow roots, under a strict CSP, and are taken out again", async () => {
  await page.goto(TT_URL);
  const out = await page.eval(`new Promise((res) => {
    const violations = [];
    document.addEventListener('securitypolicyviolation', (e) => violations.push(e.violatedDirective));
    customElements.define('x-card', class extends HTMLElement {
      constructor() { super(); const s = this.attachShadow({ mode: 'open' }), p = document.createElement('p'), a = document.createElement('a');
        p.style.cssText = 'font-size:20px;line-height:1;background:#fff;color:#000'; p.append('Inside ', a); a.href = '#'; a.textContent = 'link'; s.append(p); }
    });
    const main = document.createElement('main');
    main.append(Object.assign(document.createElement('x-card'), { id: 'one' }));
    document.body.append(main);
    A11yWidget.init({ nonce: 't3st' });
    const p = (id) => document.getElementById(id).shadowRoot.querySelector('p');
    const look = (id) => { const c = getComputedStyle(p(id)); return [c.fontSize, c.lineHeight, c.backgroundColor, getComputedStyle(p(id).querySelector('a')).textDecorationLine]; };
    const before = look('one');
    __w().setSettings({ fontSize: 150, lineHeight: 200, colorMode: 'dark-contrast', highlightLinks: true });
    // A component added later, and text added later inside a scaled shadow root (no double scaling).
    main.append(Object.assign(document.createElement('x-card'), { id: 'two' }));
    p('one').append(Object.assign(document.createElement('span'), { id: 'late', textContent: 'late' }));
    setTimeout(() => {
      const on = [look('one'), look('two'), getComputedStyle(p('one').querySelector('#late')).fontSize];
      __w().setSettings({ fontSize: 100, lineHeight: 100, colorMode: 'default', highlightLinks: false });
      const root = document.getElementById('one').shadowRoot;
      res({ before, on, off: [look('one'), root.adoptedStyleSheets.length, root.querySelectorAll('[data-a11yw-fs]').length], violations });
    }, 300);
  })`);
  const dark = ["30px", "90px", "rgb(18, 18, 18)", "underline"];
  assert.deepEqual(out, { before: ["20px", "20px", "rgb(255, 255, 255)", "underline"], on: [dark, dark, "30px"], off: [out.before, 0, 0], violations: [] });
});

test("a component defined after the settings were applied is picked up at the next change", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`document.body.innerHTML = '<x-late id="late"></x-late>'; 1`);
  await init();
  await page.eval(`__w().setSettings({ colorMode: 'dark-contrast' });
    customElements.define('x-late', class extends HTMLElement { constructor() { super(); this.attachShadow({ mode: 'open' }).innerHTML = '<p style="background:#fff">Late</p>'; } });
    __w().setSettings({ highlightLinks: true }); 1`);
  await sleep(700);
  assert.equal(await page.eval(`getComputedStyle(late.shadowRoot.querySelector('p')).backgroundColor`), "rgb(18, 18, 18)");
});

test("same-origin iframes get the same adjustments; reading aids follow the pointer into them", async () => {
  await page.goto(BLANK_URL);
  await page.eval(`new Promise((res) => { document.body.innerHTML = '<iframe id="f1" srcdoc="<p>In frame</p>"></iframe>'; f1.onload = () => res(1); })`);
  await init();
  await page.eval(`__w().setSettings({ fontSize: 150, colorMode: 'dark-contrast', contentScale: 150, readingMask: true }); 1`);
  await page.eval(`new Promise((res) => { document.body.insertAdjacentHTML('beforeend', '<iframe id="f2" srcdoc="<p>Later</p>"></iframe>'); f2.onload = () => setTimeout(() => res(1), 50); })`);
  const look = (id) => `(() => { const d = document.getElementById('${id}').contentDocument, c = getComputedStyle(d.querySelector('p'));
    return [c.fontSize, c.backgroundColor, [...d.documentElement.classList].filter((k) => k.startsWith('a11yw')).sort().join(' ')]; })()`;
  const on = ["24px", "rgb(18, 18, 18)", "a11yw-dark a11yw-font"]; // no a11yw-scale: the frame is zoomed with the page
  assert.deepEqual([await page.eval(look("f1")), await page.eval(look("f2"))], [on, on]);
  // The mask's middle lands where the pointer is in the frame, which the page zoom has scaled.
  await page.eval(`f1.contentDocument.querySelector('p').dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true, clientX: 5, clientY: 40 })); 1`);
  await sleep(50);
  const { middle, expected } = await page.eval(`(() => { const m = document.querySelector('.a11yw-mask').getBoundingClientRect(), r = f1.getBoundingClientRect();
    return { middle: m.top + m.height / 2, expected: r.top + (f1.clientTop + 40) * (r.height / f1.offsetHeight) }; })()`);
  assert.ok(Math.abs(middle - expected) < 2, `mask middle ${middle}, pointer at ${expected}`);
  await page.eval(`__w().setSettings({ fontSize: 100, colorMode: 'default', contentScale: 100, readingMask: false }); 1`);
  assert.deepEqual(await page.eval(`(() => { const d = f1.contentDocument; return [getComputedStyle(d.querySelector('p')).fontSize,
    [...d.documentElement.classList].join(' '), d.querySelectorAll('#a11yw-styles,#a11yw-font-sizes,[data-a11yw-fs]').length]; })()`), ["16px", "", 0]);
});

test("colorScheme auto follows the page's dark mode, passes axe, and ignores its own adjustments", async () => {
  const axe = fs.readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
  await page.goto(HOST_URL);
  // The site's own theme switch (a class on <html>) and its own scrollbar colors.
  await page.eval(`const s = document.createElement('style'); s.textContent = 'html{scrollbar-color:red blue} html.site-dark body{background:oklch(0.2 0.02 260);color:#eee}'; document.head.append(s); 1`);
  await init();
  const dark = `document.querySelector('.a11yw-widget').getAttribute('data-scheme')`;
  assert.equal(await page.eval(dark), null);
  await page.eval(`document.documentElement.classList.add('site-dark'); 1`);
  await sleep(150);
  assert.equal(await page.eval(dark), "dark", "follows the site's dark theme (an oklch background)");
  await openPanelAllSections();
  await sleep(300);
  await page.eval(`${axe}; 1`);
  assert.deepEqual(await page.eval(`axe.run({ include: [['.a11yw-root']] }).then((r) => r.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target).join(' | ')))`), []);
  // The panel's scrollbar uses the widget's colors, not the page's.
  assert.notEqual(await page.eval(`getComputedStyle(document.querySelector('.a11yw-body')).scrollbarColor`), "rgb(255, 0, 0) rgb(0, 0, 255)");
  await page.eval(`document.documentElement.classList.remove('site-dark'); 1`);
  await sleep(150);
  assert.equal(await page.eval(dark), null, "back to light with the site");
  // The widget's own dark contrast mode darkens the page, but the panel stays as the site is.
  await page.eval(`__w().setSettings({ colorMode: 'dark-contrast' }); 1`);
  await sleep(700);
  assert.equal(await page.eval(dark), null);
  // Explicit choices: "dark", and "auto" with the owner's own panel colors (kept light).
  await page.eval(`__w().setSettings({ colorMode: 'default' }); __w().setOptions({ colorScheme: 'dark' }); 1`);
  assert.equal(await page.eval(dark), "dark");
  await page.eval(`document.documentElement.classList.add('site-dark'); __w().setOptions({ colorScheme: 'auto', theme: { background: '#ffffff' } }); 1`);
  await sleep(150);
  assert.equal(await page.eval(dark), null);
});

test("the optional language pack works with the script build (French, Hebrew right-to-left)", async () => {
  const pack = pathToFileURL(path.resolve("dist/open-accessibility-widget.languages.global.js")).href;
  await page.goto(BLANK_URL);
  await page.eval(`new Promise((res) => { const s = document.createElement('script'); s.src = '${pack}'; s.onload = res; document.head.append(s); })`);
  await init(`{ languages: A11yWidgetLanguages.allLanguages, language: 'fr' }`);
  const look = `(() => { const w = document.querySelector('.a11yw-widget'); return [w.lang, w.dir, document.querySelector('.a11yw-title').textContent, document.querySelectorAll('.a11yw-lang-list [role=option]').length]; })()`;
  assert.deepEqual(await page.eval(look), ["fr", "ltr", "Accessibilité", 16]);
  await page.eval(`__w().setOptions({ language: 'he' }); 1`);
  assert.deepEqual(await page.eval(look), ["he", "rtl", "נגישות", 16]);
});

test("bold text and invert colors; images keep their colors under invert", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ boldText: true, invertColors: true, saturationMode: 'monochrome' }); 1`);
  const out = await page.eval(`(() => ({ weight: getComputedStyle(document.querySelector('main p')).fontWeight,
    backdrop: getComputedStyle(document.querySelector('.a11yw-backdrop')).backdropFilter,
    img: getComputedStyle(document.getElementById('iconimg')).filter }))()`);
  assert.deepEqual(out, { weight: "700", backdrop: "invert(1) hue-rotate(180deg) grayscale(1)", img: "invert(1) hue-rotate(180deg)" });
  await page.eval(`__w().setSettings({ boldText: false, invertColors: false, saturationMode: 'default' }); 1`);
  assert.equal(await page.eval(`getComputedStyle(document.getElementById('iconimg')).filter`), "none");
});

test("read aloud speaks the clicked block or focused control in its language, never the widget; Escape stops", async () => {
  await page.goto(HOST_URL);
  await page.eval(`window.__spoken = []; window.__cancelled = 0;
    speechSynthesis.speak = (u) => __spoken.push([u.text, u.lang]); speechSynthesis.cancel = () => __cancelled++;
    document.querySelector('footer p').lang = 'fr'; 1`);
  await init();
  await page.eval(`__w().setSettings({ readAloud: true }); 1`);
  await page.click("main p");
  await page.click("footer p");
  await page.click(".a11yw-launcher"); // the widget's own controls are never read
  await page.press(KEYS.Escape); // closes the panel; focus is back on the launcher
  await page.press(KEYS.Tab); // keyboard focus on the page's first link
  assert.deepEqual(await page.eval(`__spoken`), [["Paragraph with an inline link inside it.", "en"], ["Footer text", "fr"], ["Link A", "en"]]);
  await page.eval(`__cancelled = 0; 1`);
  await page.press(KEYS.Escape);
  assert.ok(await page.eval(`__cancelled > 0`), "Escape stops speaking");
  await page.eval(`__w().setSettings({ readAloud: false }); __spoken.length = 0; 1`);
  await page.click("main p");
  assert.deepEqual(await page.eval(`__spoken`), []);
});

test("text magnifier shows an image's alt text", async () => {
  await page.goto(HOST_URL);
  await init();
  await page.eval(`__w().setSettings({ textMagnifier: true }); 1`);
  const { x, y } = await page.eval(`(() => { const r = document.getElementById('iconimg').getBoundingClientRect(); return { x: r.left + 5, y: r.top + 5 }; })()`);
  await page.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await sleep(100);
  assert.equal(await page.eval(`document.querySelector('.a11yw-magnifier').textContent`), "Home");
});

test("page structure lists headings, regions and links, and jumps to the chosen one", async () => {
  const axe = fs.readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
  await page.goto(HOST_URL);
  await init(`{ feedbackUrl: 'mailto:a11y@example.com', statementUrl: 'javascript:alert(1)' }`);
  await openPanelAllSections();
  assert.deepEqual(await page.eval(`[...document.querySelectorAll('.a11yw-footer a')].map((a) => [a.textContent, a.getAttribute('href')])`),
    [["Report a problem", "mailto:a11y@example.com"]], "javascript: URLs are dropped, mailto: is kept");
  await page.eval(`[...document.querySelectorAll('.a11yw-row[aria-haspopup]')].find((b) => b.textContent === 'Page structure').click(); 1`);
  await sleep(100);
  const list = await page.eval(`(() => { const d = document.querySelector('.a11yw-reader[role=dialog]');
    return { title: d.querySelector('h2').textContent, groups: [...d.querySelectorAll('h3')].map((h) => h.textContent),
      items: [...d.querySelectorAll('li button')].map((b) => b.textContent), focus: d.contains(document.activeElement) }; })()`);
  assert.equal(list.title, "Page structure");
  assert.deepEqual(list.groups, ["Headings", "Regions", "Links"]);
  assert.ok(list.items.includes("H1Site title") && list.items.includes("H2Section heading"), list.items.join(" | "));
  assert.ok(list.items.includes("Header") && list.items.includes("Navigation") && list.items.includes("Main content") && list.items.includes("Footer"));
  assert.ok(list.items.includes("Link B"));
  assert.equal(list.focus, true);
  await page.eval(`${axe}; 1`);
  assert.deepEqual(await page.eval(`axe.run({ include: [['.a11yw-root']] }).then((r) => r.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target).join(' | ')))`), []);
  await page.eval(`[...document.querySelectorAll('.a11yw-reader li button')].find((b) => b.textContent === 'Link B').click(); 1`);
  assert.deepEqual(await page.eval(`[!!document.querySelector('.a11yw-reader'), document.activeElement.id]`), [false, "b"]);
});

test("a frame that runs its own copy of the widget is left to it", async () => {
  await page.goto(BLANK_URL);
  // Stands in for a same-site page that loads the widget itself.
  await page.eval(`new Promise((res) => { document.body.innerHTML = '<iframe id="own" srcdoc="<style id=a11yw-styles>p{color:rgb(1,2,3)}</style><p>Own widget</p>"></iframe>'; own.onload = () => res(1); })`);
  await init();
  const look = `(() => { const d = own.contentDocument; return [d.querySelectorAll('#a11yw-styles').length, getComputedStyle(d.querySelector('p')).color, d.documentElement.className]; })()`;
  await page.eval(`__w().setSettings({ colorMode: 'dark-contrast' }); 1`);
  assert.deepEqual(await page.eval(look), [1, "rgb(1, 2, 3)", ""]);
  await page.eval(`__w().setSettings({ colorMode: 'default' }); 1`);
  assert.deepEqual(await page.eval(look), [1, "rgb(1, 2, 3)", ""]);
});
