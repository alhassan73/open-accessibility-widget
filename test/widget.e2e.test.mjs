// End-to-end tests in headless Chrome against the built <script> bundle (run `npm run build` first).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { fixture, KEYS, launchBrowser, MOD, sleep } from "./cdp.mjs";

const SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='20' height='20' fill='red'/%3E%3C/svg%3E";
const HOST = `
<style>
  .toggle[aria-pressed=true]{background:#0a7d00;color:#fff;border:0;padding:6px}
  .bs-check{appearance:none;width:20px;height:20px;border:1px solid #888;background:#fff no-repeat center/contain}
  .bs-check:checked{background-color:#0d6efd;background-image:url("${SVG}")}
  #anim{transition:opacity .2s}
  #playbtn{position:absolute;top:10px;right:10px}
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
  TT_URL = fixture(dir, "tt", { head: `<meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">` });
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

test("axe-core: no violations in the panel or read mode", async (t) => {
  let axe;
  try {
    axe = await (await fetch("https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js")).text();
  } catch {
    return t.skip("axe-core could not be downloaded");
  }
  await page.goto(HOST_URL);
  await init();
  await openPanelAllSections();
  await sleep(300);
  await page.eval(`${axe}; 1`);
  const run = () =>
    page.eval(`axe.run({ include: [['.a11yw-root']] }).then((r) => r.violations.map((v) => v.id + ': ' + v.nodes.map((n) => n.target).join(' | ')))`);
  assert.deepEqual(await run(), []);
  await page.eval(`document.querySelector('.a11yw-row[aria-haspopup]').click(); 1`);
  await sleep(100);
  assert.deepEqual(await run(), []);
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
  await init(`{ features: { hideImages: false, readMode: false }, initialSettings: { fontSize: 130 } }`);
  const out = await page.eval(`(() => {
    __w().setSettings({ hideImages: true });
    const labels = [...document.querySelectorAll('.a11yw-row-label')].map((e) => e.textContent);
    return { hideImages: __w().getSettings().hideImages, fontSize: __w().getSettings().fontSize,
      hasHideRow: labels.includes('Hide images'), hasReadMode: !!document.querySelector('.a11yw-row[aria-haspopup]') };
  })()`);
  assert.deepEqual(out, { hideImages: false, fontSize: 130, hasHideRow: false, hasReadMode: false });
});

test("works under a Trusted Types CSP", async () => {
  await page.goto(TT_URL);
  assert.equal(await page.eval(`(A11yWidget.init(), document.querySelectorAll('.a11yw-root svg path').length > 0)`), true);
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

test("the widget itself is never changed by its own adjustments", async () => {
  await page.goto(HOST_URL);
  await init();
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
    readableFont: true, highlightTitles: true, highlightLinks: true, highlightHover: true, highlightFocus: true,
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
