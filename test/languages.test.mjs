// Unit tests for the optional language pack, against the built ESM entry (run `npm run build` first).
import assert from "node:assert/strict";
import { test } from "node:test";
import { builtInLanguages, defaultLabels } from "../dist/index.js";
import { allLanguages, extraLanguages } from "../dist/languages.js";

const placeholders = (s) => (s.match(/\{\w+\}/g) ?? []).sort().join(" ");

test("every extra language translates every label and keeps its placeholders", () => {
  for (const language of extraLanguages) {
    assert.deepEqual(Object.keys(language.labels).sort(), Object.keys(defaultLabels).sort(), language.code);
    for (const [key, english] of Object.entries(defaultLabels)) {
      const text = language.labels[key];
      assert.ok(typeof text === "string" && text.trim(), `${language.code}.${key} is empty`);
      // {label} is optional (without it the setting name is appended); the others are required.
      const need = placeholders(english);
      if (need) assert.equal(placeholders(text), need, `${language.code}.${key}`);
    }
  }
});

test("language pack: unique codes, own-language names, built-ins first, frozen", () => {
  const codes = allLanguages.map((l) => l.code);
  assert.equal(new Set(codes).size, codes.length);
  assert.deepEqual(allLanguages.slice(0, 2), builtInLanguages);
  assert.ok(allLanguages.length >= 16);
  assert.equal(allLanguages.find((l) => l.code === "he").dir, "rtl");
  assert.equal(allLanguages.find((l) => l.code === "fr").name, "Français");
  assert.ok(Object.isFrozen(allLanguages) && Object.isFrozen(extraLanguages[0].labels));
});
