import { defineConfig, type Options } from "tsup";

const shared: Options = {
  target: "es2019",
  minify: true,
  sourcemap: true,
  // Keep Arabic labels as UTF-8 instead of \uXXXX escapes (≈3× smaller).
  esbuildOptions: (options) => {
    options.charset = "utf8";
  },
};

export default defineConfig([
  // npm package: ESM + CJS + type declarations for both
  {
    ...shared,
    entry: { index: "src/index.ts", react: "src/react.ts" },
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    external: ["react"],
    // Marks the React entry as a Client Component for Next.js App Router.
    banner: { js: '"use client";' },
  },
  // <script> tag build: exposes window.A11yWidget
  {
    ...shared,
    entry: { "open-accessibility-widget": "src/index.ts" },
    format: ["iife"],
    globalName: "A11yWidget",
    outExtension: () => ({ js: ".global.js" }),
  },
]);
