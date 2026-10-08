// Fails when the <script> bundle grows past its gzip budget. Run after `npm run build`.
import fs from "node:fs";
import { gzipSync } from "node:zlib";

const BUDGET_KB = 22;
const file = "dist/open-accessibility-widget.global.js";
const kb = gzipSync(fs.readFileSync(file), { level: 9 }).length / 1024;
console.log(`${file}: ${kb.toFixed(2)} KB gzipped (budget ${BUDGET_KB} KB)`);
if (kb > BUDGET_KB) {
  console.error("Bundle size budget exceeded.");
  process.exit(1);
}
