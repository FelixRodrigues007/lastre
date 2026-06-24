# Design Sync — Lastro Advertising Materials

You are helping create or review Lastro advertising materials using the repository design system.

## Inputs

The user may provide a goal, platform, format, angle, copy, or asset request in Portuguese or English.

## Required context

Read these files before producing work:

1. `design-system/product-marketing-context.md`
2. `design-system/README.md`
3. `design-system/tokens/lastro-ads.tokens.json`
4. `design-system/templates/ad-formats.md`
5. `design-system/templates/copy-matrix.md`
6. `design-system/templates/composition-rules.md`
7. `design-system/DESIGN_SYNC.md`

Use `design-system/examples/linkedin-proof-before-token.svg`, `design-system/examples/square-1080.svg`, and `design-system/examples/story-1080x1920.svg` as starter visual patterns for editable SVG ads.

## Output rules

- Create advertising materials, not app UI.
- Keep all repo artifacts in professional English.
- It is okay to explain decisions to the user in Portuguese if they asked in Portuguese.
- Use only fictional data.
- Do not use real companies, real people, real mines, or real customer logos.
- Do not use investment/yield/ROI/return/profit/token-sale language except when explicitly listing banned wording.
- Never claim the LLM decides truth. The deterministic seal decides the verdict; the LLM decides only the action.
- When showing rejection, state that Invalid is recorded on-chain as permanent proof, not discarded as an error.

## Recommended deliverables

For a new ad request, produce:

1. A short creative brief.
2. One selected angle from `copy-matrix.md`.
3. 3–5 copy variants with character counts when platform constraints matter.
4. One editable SVG or a precise SVG modification plan.
5. A compliance/guardrail checklist.
6. Run `python3 design-system/scripts/lint.py` after creating or editing SVG copy.
7. Run `design-system/scripts/render.sh` when upload-ready PNG exports are needed.
6. Any uncertainties to confirm with Felix.

## Default assumptions

If the user does not specify a format, default to LinkedIn feed `1200x627`.
If the user does not specify an angle, default to `Proof before token`.
If the user asks for “materiais publicitários” broadly, first create a reusable design-system artifact rather than one-off ads.
