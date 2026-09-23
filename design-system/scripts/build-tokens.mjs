import { readFileSync, writeFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const tokens = JSON.parse(
  readFileSync(new URL("tokens/lastre.tokens.json", root), "utf8"),
);
const check = process.argv.includes("--check");
const ref = (name) => `var(--lastre-${name})`;
const referencePattern =
  /\{(primitive|foundation|semantic|component)\.([^}]+)\}/g;
const groupsFor = (mode) => ({ ...tokens, semantic: tokens.semantic[mode] });
// Validate the entire reference graph before writing either output. A cycle or
// missing role must fail the build rather than silently invalidate runtime CSS.
for (const mode of Object.keys(tokens.semantic)) {
  const groups = groupsFor(mode);
  const done = new Set();
  const names = new Set();
  const visit = (group, name, stack = []) => {
    const key = `${group}.${name}`;
    if (stack.includes(key))
      throw new Error(`Token cycle (${mode}): ${[...stack, key].join(" → ")}`);
    if (done.has(key)) return;
    const token = groups[group]?.[name];
    if (!token || typeof token.$value !== "string")
      throw new Error(`Invalid token (${mode}): ${key}`);
    for (const match of token.$value.matchAll(referencePattern))
      visit(match[1], match[2], [...stack, key]);
    if (/\{[^}]+\}/.test(token.$value.replace(referencePattern, "")))
      throw new Error(`Unsupported reference: ${key}`);
    done.add(key);
  };
  for (const group of ["primitive", "foundation", "semantic", "component"]) {
    for (const name of Object.keys(groups[group])) {
      if (names.has(name)) throw new Error(`Duplicate CSS token name: ${name}`);
      names.add(name);
      visit(group, name);
    }
  }
}
const modes = Object.values(tokens.semantic).map((group) =>
  Object.keys(group).sort().join(","),
);
if (new Set(modes).size !== 1)
  throw new Error("Semantic roles must exist in every theme");
const value = (token) =>
  token.$value.replace(referencePattern, (_, _group, name) => ref(name));
const block = (selector, entries) =>
  `${selector} {\n${Object.entries(entries)
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n")}\n}\n`;
const entries = (group) =>
  Object.fromEntries(
    Object.entries(group).map(([k, v]) => [`lastre-${k}`, value(v)]),
  );
const header =
  "/* Generated from lastre.tokens.json. Run npm run tokens:build. */\n";
const css =
  header +
  '@import "../assets/fonts/fonts.css";\n@import "../assets/brand.css";\n\n' +
  block(":root", {
    ...entries(tokens.primitive),
    ...entries(tokens.foundation),
  }) +
  block(':root, [data-theme="dark"]', {
    ...entries(tokens.semantic.dark),
    ...entries(tokens.component),
  }) +
  block('[data-theme="light"]', {
    ...entries(tokens.semantic.light),
    ...entries(tokens.component),
  });

// Keep existing LP and console consumers working while new code adopts --lastre-*.
const aliases = {};
const alias = (old, next) => {
  aliases[`lastro-${old}`] = ref(next);
};
alias("gradient-seal-shine", "gradient-accent-text");
const families = {
  olive: {
    950: 950,
    925: 950,
    900: 900,
    875: 900,
    850: 900,
    800: 800,
    750: 800,
    700: 700,
    600: 600,
    500: 500,
    400: 400,
    300: 300,
  },
  sage: { 400: 300, 300: 200, 200: 100 },
  cream: { 50: 50, 100: 50, 200: 100, 300: 200 },
  seal: {
    200: 100,
    250: 100,
    300: 200,
    350: 200,
    400: 300,
    450: 400,
    500: 500,
    600: 600,
    700: 700,
    800: 800,
  },
  jade: { 950: 950, 300: 200, 400: 300, 500: 500, 600: 600, 700: 700 },
  sky: { 300: 200, 400: 300, 500: 500, 600: 600 },
  amber: { 300: 100, 400: 200, 500: 300, 600: 600 },
  orange: { 300: 400, 400: 500, 500: 600, 600: 700 },
};
for (const [family, shades] of Object.entries(families)) {
  const next = ["olive", "sage", "cream"].includes(family)
    ? "mirage"
    : family === "amber"
      ? "gold"
      : "blue";
  for (const [shade, target] of Object.entries(shades))
    alias(`color-${family}-${shade}`, `color-${next}-${target}`);
}
for (const name of ["display", "body", "mono"])
  alias(`font-${name}`, `font-${name}`);
const roles = {
  "bg-primary": "bg-canvas",
  "bg-panel": "bg-surface",
  "bg-elevated": "bg-elevated",
  "bg-inverse": "text-primary",
  "text-primary": "text-primary",
  "text-secondary": "text-secondary",
  "text-muted": "text-muted",
  "text-inverse": "text-inverse",
  "accent-brand": "link",
  "accent-brand-soft": "action-primary",
  "accent-brand-bright": "link",
  "accent-trust": "info",
  "accent-trust-soft": "action-primary",
  "accent-success": "success",
  "accent-success-soft": "success",
  "accent-warn": "warning",
  "accent-info": "info",
  "accent-danger": "danger",
  "brand-seal": "link",
  "brand-seal-bright": "link",
  "brand-seal-text": "link",
  "brand-orange": "action-primary",
  "status-valid": "success",
  "status-invalid": "danger",
  "border-subtle": "border-subtle",
  "border-strong": "border-strong",
  "button-primary-bg": "action-primary",
  "button-primary-text": "action-text",
  "badge-text": "link",
  "adcard-bg": "bg-surface",
  "shadow-sm": "shadow-sm",
  "shadow-md": "shadow-md",
  "shadow-lg": "shadow-md",
  "shadow-xl": "shadow-md",
};
for (const [old, next] of Object.entries(roles)) alias(old, next);
for (const [role, next] of Object.entries({
  brand: "link",
  trust: "info",
  success: "success",
  warn: "warning",
  info: "info",
  danger: "danger",
})) {
  aliases[`lastro-fill-${role}`] =
    `color-mix(in srgb, ${ref(next)} 10%, transparent)`;
  aliases[`lastro-fill-${role}-strong`] =
    `color-mix(in srgb, ${ref(next)} 18%, transparent)`;
  aliases[`lastro-border-${role}`] =
    `color-mix(in srgb, ${ref(next)} 30%, transparent)`;
}
for (const [old, next] of Object.entries({
  "gradient-surface-panel": "bg-surface",
  "gradient-surface-elevated": "bg-elevated",
  "gradient-surface-canvas": "bg-canvas",
  "gradient-cta": "action-primary",
  "surface-clear": "bg-surface",
}))
  alias(old, next);
for (const [name, family, shade] of [
  ["mint", "blue", 300],
  ["jade", "blue", 500],
  ["sky", "blue", 300],
  ["amber", "gold", 200],
]) {
  const hex = tokens.primitive[`color-${family}-${shade}`].$value;
  aliases[`lastro-${name}-wash`] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16))
    .join(", ");
}
const compat =
  header +
  block(
    ':root, [data-theme="dark"], [data-theme="light"], :root[data-theme="light"]',
    aliases,
  );
for (const [file, contents] of [
  ["tokens/lastre.css", css],
  ["tokens/lastre-compat.css", compat],
]) {
  const path = new URL(file, root);
  if (check) {
    if (readFileSync(path, "utf8") !== contents)
      throw new Error(`${file} is stale; run npm run tokens:build`);
  } else writeFileSync(path, contents);
}
console.log(
  `Lastre tokens ${check ? "verified" : "generated"}: ${Object.keys(tokens.primitive).length} primitives, ${Object.keys(tokens.semantic.dark).length} semantic roles × 2 themes, ${Object.keys(tokens.component).length} component tokens.`,
);
