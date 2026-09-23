# Lastre Advertising Design System

A compact design system for producing Lastre advertising materials: social ads, launch graphics, demo slides, paid media tests, and ecosystem announcements.

> **Core line:** Proof before token — the chain of proof from land to token, verified offline and anchored on Casper.

## Purpose

This system keeps Lastre materials consistent, technically precise, and safe for public communication. It is built for ads and promo assets, not app UI.

Use it to create:
- LinkedIn/X launch posts and paid social images.
- Google/Meta display concepts.
- Demo thumbnails and slide covers.
- Hackathon submission graphics.
- Architecture explainers.

## Non-negotiable messaging guardrails

1. **Do not imply investment returns.** Avoid yield, ROI, profit, appreciation, passive income, or token sale language.
2. **Use fictional data only.** Demo examples may use fictional names like “Mineradora Vale do Ouro,” but never real companies or people.
3. **Never say the LLM decides truth.** The deterministic seal decides the verdict; the LLM/agent decides the action.
4. **Show the rejected path.** Invalid provenance is recorded on-chain as permanent proof, not discarded as an error.
5. **Be precise about maturity.** Lastre is an early prototype/demo unless the repo status says otherwise.

## Brand idea

Lastre should feel like **forensic infrastructure**: dark, precise, grounded, and trustable. It should avoid generic crypto gradients, speculative hype, and abstract “AI magic.”

### Personality

| Trait | Meaning in design |
|---|---|
| Forensic | Structured proof trails, seals, ledgers, coordinates |
| Grounded | Earth/mineral tones, strong grids, no fantasy visuals |
| Technical | Monospace annotations, hashes, contract references |
| Restrained | Short claims, high contrast, plenty of negative space |
| Accountable | Valid and Invalid outcomes shown side by side |

## System structure

```text
design-system/
  product-marketing-context.md      # Positioning/context used by ad work
  tokens/
    lastro-ads.tokens.json          # Token source for design tools
    lastro-ads.css                  # CSS variables for web/SVG assets
  templates/
    ad-formats.md                   # Sizes, layouts, placement rules
    copy-matrix.md                  # Approved angles and sample ad copy
    composition-rules.md            # Layout system and do/don't rules
  assets/
    lastro-mark.svg                 # Provisional vector mark
  examples/
    linkedin-proof-before-token.svg # Editable LinkedIn/wide creative
    square-1080.svg                 # Editable square social creative
    story-1080x1920.svg             # Editable vertical story creative
  scripts/
    render.sh                       # Export SVG templates to PNG/JPG
    lint.py                         # Guardrail, XML, token, and contrast checks
  outputs/
    png/                            # Rendered upload-ready PNG files
```

## Visual foundation

### Color roles

| Role | Token | Usage |
|---|---|---|
| Obsidian | `--lastro-bg-primary` | Main background |
| Paper | `--lastro-text-primary` | Main text |
| Provenance green | `--lastro-brand-proof` | Valid proof, chain-of-proof highlights |
| Seal gold | `--lastro-brand-seal` | SHA-256 seal, proof artifact, hash callouts |
| Signal red | `--lastro-brand-signal` | Invalid/rejected proof, risk, tamper cue |
| Network blue | `--lastro-brand-network` | Casper/network anchoring cue |

### Typography

- **Display:** Space Grotesk or a geometric sans fallback. If Space Grotesk is not installed, templates fall back to Inter/system sans and remain usable.
- **Body:** Inter or system sans.
- **Technical annotation:** JetBrains Mono / IBM Plex Mono / ui-monospace.

Hierarchy for social ads:
1. Eyebrow: proof/action/status label.
2. Headline: one sharp idea, 5–9 words.
3. Support: one explanatory sentence.
4. Proof rail: `Offline seal → Casper attest → Valid/Invalid`.
5. Footer: Lastre mark + category (`RWA provenance trust layer`).

## Recommended ad modules

| Module | Purpose | Example |
|---|---|---|
| Proof rail | Shows the pipeline | `Offline SHA-256 seal → Casper attestation → recorded verdict` |
| Verdict pair | Shows both outcomes | `Valid is proof. Invalid is proof too.` |
| Hash chip | Makes the proof tactile | `seal: a3f1…ff00` |
| Guardrail badge | Prevents AI overclaiming | `LLM decides action, not verdict` |
| Fictional-data note | Compliance safety | `Demo uses fictional data` |

## Production checklist

Before exporting any ad creative:

- [ ] Uses only fictional data or generic technical claims.
- [ ] No investment/yield/ROI/return wording.
- [ ] Does not imply a real customer, real mine, or real issuer.
- [ ] Clearly separates seal verdict from LLM action.
- [ ] If “Invalid” appears, it is described as recorded proof, not a failed demo.
- [ ] Text remains legible at mobile feed size.
- [ ] Contrast meets WCAG AA for main text.
- [ ] CTA points to repo/demo/docs, not a token sale or investment action.


## Render and QA workflow

Render upload-ready PNG files from editable SVG templates:

```bash
# From repo root
design-system/scripts/render.sh

# Optional: 2x retina/source export
SCALE=2 design-system/scripts/render.sh

# Optional: also emit JPG versions
FORMAT=jpg design-system/scripts/render.sh
```

Run guardrail and quality checks:

```bash
python3 design-system/scripts/lint.py
```

The linter validates token JSON, SVG XML, banned wording in rendered ad copy, and core color contrast.

## Fast start

1. Pick an angle from `templates/copy-matrix.md`.
2. Pick a size/layout from `templates/ad-formats.md`.
3. Use tokens from `tokens/lastro-ads.css`.
4. Start from `examples/linkedin-proof-before-token.svg` for a feed graphic.
5. Replace only headline/support/proof chips; keep guardrails intact.

## Unresolved decisions

- The logo/mark in `assets/lastro-mark.svg` is provisional.
- Typeface choices assume Space Grotesk + Inter; replace with licensed brand fonts if chosen.
- The palette is a candidate direction; validate against any existing Lastre visual identity before scaling.
