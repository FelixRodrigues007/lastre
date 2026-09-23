import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const tokens = JSON.parse(
  readFileSync(
    new URL("../tokens/lastre.tokens.json", import.meta.url),
    "utf8",
  ),
);
const luminance = (hex) => {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
};
const contrast = (a, b) =>
  (Math.max(luminance(a), luminance(b)) + 0.05) /
  (Math.min(luminance(a), luminance(b)) + 0.05);
let checks = 0;
const mix = (a, b, weight) =>
  "#" +
  [1, 3, 5]
    .map((i) =>
      Math.round(
        parseInt(a.slice(i, i + 2), 16) * weight +
          parseInt(b.slice(i, i + 2), 16) * (1 - weight),
      )
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
for (const [mode, semantics] of Object.entries(tokens.semantic)) {
  const resolve = (key) =>
    tokens.primitive[semantics[key].$value.slice(11, -1)].$value;
  const pairs = [];
  for (const bg of ["bg-canvas", "bg-surface", "bg-elevated"]) {
    for (const fg of [
      "text-primary",
      "text-secondary",
      "text-muted",
      "link",
      "success",
      "danger",
      "warning",
      "info",
    ])
      pairs.push([fg, bg, 4.5]);
    pairs.push(["focus", bg, 3], ["border-control", bg, 3]);
  }
  for (const bg of ["action-primary", "action-hover", "action-pressed"])
    pairs.push(["action-text", bg, 4.5]);
  pairs.push(["accent-text", "accent", 4.5]);
  for (const [fg, bg, minimum] of pairs) {
    const ratio = contrast(resolve(fg), resolve(bg));
    assert(
      ratio >= minimum,
      `${mode}: ${fg} on ${bg} = ${ratio.toFixed(2)}; requires ${minimum}`,
    );
    checks++;
  }
  // Notices use an opaque sRGB tint on the surface. Check the actual mixed
  // background, since a passing foreground on the plain surface is insufficient.
  for (const tone of ["info", "success", "warning", "danger"]) {
    const formula = semantics[`${tone}-surface`].$value;
    const match = formula.match(
      /^color-mix\(in srgb, \{semantic\.([^}]+)\} (\d+)%, \{semantic\.([^}]+)\}\)$/,
    );
    assert(match, `${mode}: unsupported notice mix ${formula}`);
    const background = mix(
      resolve(match[1]),
      resolve(match[3]),
      Number(match[2]) / 100,
    );
    for (const fg of [tone, "text-primary", "text-secondary"]) {
      const ratio = contrast(resolve(fg), background);
      assert(
        ratio >= 4.5,
        `${mode}: ${fg} on ${tone}-surface = ${ratio.toFixed(2)}`,
      );
      checks++;
    }
  }
  assert(
    contrast(
      tokens.primitive["color-white"].$value,
      tokens.primitive["color-danger-light"].$value,
    ) >= 4.5,
    "Danger button contrast",
  );
  checks++;
  // Gold text uses its own theme-aware stops, separate from decorative metal.
  const stops = [
    ...semantics["gradient-accent-text"].$value.matchAll(
      /\{primitive\.([^}]+)\}/g,
    ),
  ].map((match) => tokens.primitive[match[1]].$value);
  assert(stops.length >= 2, `${mode}: missing gold text gradient stops`);
  for (const stop of stops) {
    for (const bg of ["bg-canvas", "bg-surface", "bg-elevated"]) {
      const ratio = contrast(stop, resolve(bg));
      assert(
        ratio >= 4.5,
        `${mode}: gold stop ${stop} on ${bg} = ${ratio.toFixed(2)}`,
      );
      checks++;
    }
  }
}
console.log(
  `${checks} contrast checks passed (text ≥ 4.5:1; focus/control borders ≥ 3:1).`,
);
