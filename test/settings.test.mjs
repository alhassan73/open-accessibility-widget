// Unit tests for the settings model, against the built ESM entry (run `npm run build` first).
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  builtInLanguages,
  DEFAULT_SETTINGS,
  defaultLabels,
  PROFILE_PRESETS,
  RANGES,
  sanitizeSettings,
} from "../dist/index.js";

test("sanitizeSettings: empty / wrong input gives defaults", () => {
  for (const input of [null, undefined, 42, "x", [], { fontSize: "big" }]) {
    assert.deepEqual(sanitizeSettings(input), { ...DEFAULT_SETTINGS, profiles: [] });
  }
});

test("sanitizeSettings: clamps and rounds ranges, drops non-finite numbers", () => {
  const s = sanitizeSettings({ fontSize: 1e9, contentScale: -5, lineHeight: 133.4, letterSpacing: NaN });
  assert.equal(s.fontSize, RANGES.fontSize.max);
  assert.equal(s.contentScale, RANGES.contentScale.min);
  assert.equal(s.lineHeight, 133);
  assert.equal(s.letterSpacing, 100);
  assert.equal(sanitizeSettings({ fontSize: Infinity }).fontSize, 100);
});

test("sanitizeSettings: enums, colors, booleans and profiles are validated", () => {
  const s = sanitizeSettings({
    colorMode: "evil",
    cursor: "black",
    textColor: "red;}body{display:none",
    titleColor: "#ABCDEF",
    backgroundColor: null,
    hideImages: "yes",
    readableFont: true,
    profiles: ["visionImpaired", "visionImpaired", "nope", 3],
  });
  assert.equal(s.colorMode, "default");
  assert.equal(s.cursor, "black");
  assert.equal(s.textColor, null);
  assert.equal(s.titleColor, "#abcdef");
  assert.equal(s.backgroundColor, null);
  assert.equal(s.hideImages, false);
  assert.equal(s.readableFont, true);
  assert.deepEqual(s.profiles, ["visionImpaired"]);
});

test("sanitizeSettings: ignores unknown keys and never pollutes prototypes", () => {
  const s = sanitizeSettings(JSON.parse('{"__proto__": {"polluted": true}, "constructor": 1, "extra": 2}'));
  assert.equal({}.polluted, undefined);
  assert.equal("extra" in s, false);
  assert.deepEqual(Object.keys(s), Object.keys(DEFAULT_SETTINGS));
});

test("exported constants are frozen", () => {
  for (const value of [DEFAULT_SETTINGS, RANGES, RANGES.fontSize, PROFILE_PRESETS, PROFILE_PRESETS.visionImpaired, defaultLabels, builtInLanguages]) {
    assert.equal(Object.isFrozen(value), true);
  }
});

test("every profile preset only uses valid settings", () => {
  for (const [id, preset] of Object.entries(PROFILE_PRESETS)) {
    assert.deepEqual(sanitizeSettings({ ...DEFAULT_SETTINGS, ...preset }), { ...DEFAULT_SETTINGS, ...preset, profiles: [] }, id);
  }
});
