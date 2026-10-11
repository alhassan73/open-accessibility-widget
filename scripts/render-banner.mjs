// Renders .github/assets/*.html to PNG with the headless Chrome of the e2e tests (test/cdp.mjs), so it
// needs no extra dependency. Usage: npm run banner (after `npm install`, which brings the Almarai font).
// The social preview is also copied to the docs site (examples/public), where it is the Open Graph image.
import { copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { launchBrowser, sleep } from "../test/cdp.mjs";

const assets = resolve(".github/assets");
// The README banner is 2x for high-density screens; the social preview is an Open Graph image, used at
// 1280×640 exactly, so 1x keeps it light.
const JOBS = [
  { name: "banner", width: 1600, height: 520, scale: 2 },
  {
    name: "social-preview",
    width: 1280,
    height: 640,
    scale: 1,
    copyTo: "examples/public/social-preview.png",
  },
];

const { page, close } = await launchBrowser();
try {
  for (const { name, width, height, scale, copyTo } of JOBS) {
    await page.goto(pathToFileURL(resolve(assets, `${name}.html`)).href);
    await page.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
    const fonts = await page.eval("document.fonts.ready.then(() => [...document.fonts].filter((f) => f.status === 'loaded').length)");
    if (!fonts) throw new Error(`${name}: no web font loaded; run npm install first`);
    await sleep(200);
    const { data } = await page.send("Page.captureScreenshot", {
      format: "png",
      clip: { x: 0, y: 0, width, height, scale: 1 },
    });
    const png = Buffer.from(data, "base64");
    const file = resolve(assets, `${name}.png`);
    await writeFile(file, png);
    if (copyTo) await copyFile(file, resolve(copyTo));
    console.log(`rendered ${name}.png (${Math.round(png.length / 1024)} KB, ${fonts} fonts)`);
  }
} finally {
  await close();
}
