# `/design-sync` Workflow for Lastro Advertising Materials

Use this workflow when asking Claude/Codex/Fugu to create or review Lastro advertising assets.

## Recommended prompt

```text
/design-sync Create an advertising asset for Lastro using design-system/.
Goal: [launch post | display ad | demo thumbnail | ecosystem announcement]
Platform/format: [LinkedIn 1200x627 | square 1080x1080 | story 1080x1920 | X 1600x900]
Angle: [Proof before token | Invalid is proof too | LLM is not truth | Casper-native anchoring]
CTA: [Review the architecture | Explore the demo | Read the contract]
Required guardrail: no investment/yield/ROI language; fictional data only.
Output: editable SVG + short copy variants.
```

## Required source files

1. `product-marketing-context.md` — positioning and messaging guardrails.
2. `tokens/lastro-ads.tokens.json` — design-token source.
3. `tokens/lastro-ads.css` — CSS variables for web/SVG assets.
4. `templates/ad-formats.md` — sizes and layout recipes.
5. `templates/copy-matrix.md` — approved ad angles and sample copy.
6. `templates/composition-rules.md` — visual hierarchy and proof-rail rules.
7. `examples/linkedin-proof-before-token.svg` — starter wide editable SVG.
8. `examples/square-1080.svg` — square social editable SVG.
9. `examples/story-1080x1920.svg` — vertical story editable SVG.

## Design-sync checks

Before accepting any generated material:

- The asset uses one approved angle.
- The headline is one idea, no more than two lines.
- The proof rail is sequential: origin/seal → Casper → verdict.
- The CTA does not imply investing, buying tokens, or earning returns.
- Any named companies/mines/people are fictional.
- The copy does not make the LLM the source of truth.
- Invalid/rejected is framed as recorded proof, not as a failed demo.
- The material is legible at mobile feed size.

## Render / QA commands

```bash
python3 design-system/scripts/lint.py
design-system/scripts/render.sh
```

## Output naming

```text
design-system/outputs/YYYY-MM-DD-platform-angle-size.svg
```

Examples:

```text
design-system/outputs/2026-06-24-linkedin-proof-before-token-1200x627.svg
design-system/outputs/2026-06-24-x-llm-is-not-truth-1600x900.svg
```
