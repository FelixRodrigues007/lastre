# Lastro Design System — Olive Palette (v0.2)

**Status:** spec / awaiting review
**Date:** 2026-06-25
**Scope:** Reskin the single source-of-truth token system for Lastro around a new
5-color olive palette, with intentional light + dark themes. Serves both
advertising assets and the future app/site UI.

## Goal

Replace the current obsidian/multi-hue ad tokens with a disciplined,
near-monochromatic **olive + single accent** system that matches the Lastro
thesis ("land → proof → token"). One token source feeds ads and product UI to
prevent drift.

Non-goals: building the app/site frontend (web/ stays a placeholder for now);
redesigning ad templates/SVGs beyond swapping token values.

## Source palette (exact)

| Role seed | Hex | rgb |
|---|---|---|
| olive near-black | `#121407` | 18,20,7 |
| olive dark | `#30331e` | 48,51,30 |
| sage | `#c5c7b0` | 197,199,176 |
| cream | `#e7e6d0` | 231,230,208 |
| seal (yellow) | `#fef16f` | 254,241,111 |

The system reads as a single yellow-green (olive) hue family across neutrals,
plus one bright accent (seal). This is intentional: hierarchy comes from
typography, scale, and space — **not** from color variety. Accent (seal) appears
only on CTAs, the verification seal, and key values.

## Architecture

Three layers, unchanged structure from the current token file so existing
tooling (`scripts/lint.py`, `render.sh`) keeps working:

```
primitive   → raw color ramps, type, space, radius, stroke
semantic    → roles (background/text/brand/status/border), themed light + dark
component   → adCard, badge, proofRail, button, seal — reference semantic
```

Outputs:
- `design-system/tokens/lastro.tokens.json` (renamed from `lastro-ads`, single source)
- `design-system/tokens/lastro.css` — `:root` = dark default, `:root[data-theme="light"]` overrides
- Keep `lastro-ads.*` as thin re-export/alias for one release so nothing breaks, then remove.

## Primitive ramps

### olive (cool-dark neutral, low chroma)
```
950 #121407   900 #181b0c   850 #1f2211   800 #262916
700 #30331e   600 #3f4329   500 #545736   400 #6e7249   300 #8c9063
```

### sage (mid neutral)
```
400 #b3b59c   300 #c5c7b0   200 #d3d4c1
```

### cream (light neutral)
```
50 #f4f3e6   100 #efeede   200 #e7e6d0   300 #dadbc2
```

### seal (brand accent — yellow)
```
300 #fff39a   400 #fef16f   500 #f2df3e   600 #cdb820   700 #9c8c12
```
`seal-600/700` exist for legible accent **text** on light surfaces (raw `#fef16f`
fails contrast on cream). On both themes, the seal *button* is a yellow fill with
olive-950 text.

### Functional (outside the brand palette, olive-harmonized) — Valid/Invalid/error only
```
valid  (moss)   400 #9ab84a   500 #6f8f2e   600 #577322
invalid (clay)  400 #d9603f   500 #c34a2c   600 #9e3a22
```
These are the *only* non-palette colors. Used strictly for verdict + error
states (`Valid`, `Invalid`, destructive). Never decorative.

## Semantic roles (themed)

| role | dark (`:root`) | light (`[data-theme=light]`) |
|---|---|---|
| `background.primary` | olive-950 | cream-200 |
| `background.panel` | olive-900 | cream-100 |
| `background.elevated` | olive-800 | cream-50 |
| `background.inverse` | cream-200 | olive-950 |
| `text.primary` | cream-200 | olive-950 |
| `text.secondary` | sage-300 | olive-700 |
| `text.muted` | olive-400 | olive-500 |
| `text.inverse` | olive-950 | cream-50 |
| `brand.seal` | seal-400 | seal-600 (text) / seal-400 (fill) |
| `status.valid` | valid-400 | valid-500 |
| `status.invalid` | invalid-400 | invalid-500 |
| `border.subtle` | cream alpha 0.12 | olive alpha 0.12 |
| `border.strong` | cream alpha 0.28 | olive alpha 0.24 |

Contrast: every text-on-bg pair targets WCAG AA (≥4.5 body, ≥3 large). cream-200
on olive-950 ≈ 14:1; olive-950 on cream-200 ≈ 14:1; seal fill + olive text ≈ 11:1.

## Typography / space / radius

Keep current scales (Space Grotesk display / Inter body / JetBrains mono;
4px space base; radius sm/md/lg/pill). No change — they're sound and
hierarchy-by-type is the point. Only color tokens are reworked.

## Components (token-level)

- `button.primary` → seal fill, olive-950 text, both themes.
- `button.secondary` → transparent, border.strong, text.primary.
- `badge` → seal alpha tint + seal text (dark) / olive text (light).
- `proofRail` → valid = status.valid, invalid = status.invalid, seal = brand.seal.
- `adCard.background` → dark: olive gradient `#121407 → #262916 → #30331e`;
  light: cream flat `#e7e6d0`.

## Verification

- `scripts/lint.py` passes on the new token file.
- A small contrast check (script or manual table) confirms AA on the pairs above.
- Re-render the 3 example SVGs (`render.sh`) and eyeball both surfaces.
- No raw hex outside `primitive` layer (design-system-check discipline).

## Open risks

- Pure-olive monochrome can feel flat if type hierarchy is weak — mitigated by
  keeping the existing strong type scale and reserving seal for emphasis.
- `lastro-ads` → `lastro` rename touches references in templates/scripts; alias
  shim covers one release.
