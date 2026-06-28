# Lastre Landing Page Creative Spec

This is the creative brief for the polished public landing page on `lastre.io`.
It complements the technical route/API docs.

## Design direction

Brand: Lastre.

Visual tone: forensic infrastructure — dark mineral surfaces, seal-gold accents,
precise hashes, grounded provenance imagery, and restraint.

Motion principle: one memorable choreography is better than many small effects.
The signature moment is the fraud reveal: a tiny field change breaks the seal and
produces an `Invalid` verdict.

Required banner on every screen:

```text
DEMONSTRATION — simulated assets, no investment offered
```

## 1. Hero

Eyebrow:

```text
LIVE ON CASPER TESTNET · PROOF-OF-PROVENANCE PROTOCOL
```

Headline:

```text
Proof before token.
```

Body:

```text
Lastre verifies physical provenance offline and deterministically, then anchors the verdict on Casper — before any token or agent acts on the data.
```

Primary CTA:

```text
Verify provenance
```

Secondary CTA:

```text
Spot the fraud
```

Motion:

- seal mark draws once on page load;
- hash resolves character-by-character;
- hero text enters with a short clip/fade;
- total duration around 1.2s;
- no infinite loop.

## 2. Trust gap

Eyebrow:

```text
THE TRUST GAP
```

Headline:

```text
The agent economy is being built on unverified claims.
```

Body:

```text
Autonomous agents and tokenized real-world asset systems can only be as reliable as the physical data they consume. Lastre proves where the data came from before anything acts on it.
```

## 3. Mechanism

Eyebrow:

```text
THE LAYER BENEATH
```

Headline:

```text
Lastre proves origin before any token or agent touches the data.
```

Flow:

```text
Field measurement → deterministic SHA-256 seal → Casper attestation → Valid or Invalid
```

Required note:

```text
The seal decides the verdict. The LLM can only choose an action.
```

## 4. Tamper proof

Headline:

```text
Change one gram. The seal breaks.
```

Interaction:

- show reference mass;
- allow `+1 g` tamper;
- show reference seal and submitted seal;
- show `Valid` before tamper and `Invalid` after tamper;
- make the changed field visually obvious.

Key copy:

```text
A rejection is proof, not a discarded error.
```

## 5. Live proof panel

Must read from the gateway:

- `/proof`;
- `/catalog`;
- `/verdict/MINA-VALEDOURO-LOTE-001`;
- `/verdict/MINA-VALEDOURO-LOTE-002`.

Expected states:

```text
MINA-VALEDOURO-LOTE-001 → Invalid
MINA-VALEDOURO-LOTE-002 → Valid
```

The panel must include a manual refresh button.

## 6. Spot-the-Fraud teaser

Headline:

```text
Can you catch the tampered seal?
```

CTA:

```text
Spot the fraud
```

This should link to `/spot-fraud` and become the highest-energy interaction in
the demo.

## 7. Honesty section

Headline:

```text
A demonstration, by design.
```

Body:

```text
Every asset shown here is fictional. Lastre verifies provenance; it does not offer investment exposure, ownership, yield, or a token sale.
```

## 8. Footer

Footer links:

- GitHub;
- Casper Testnet package;
- Proof page;
- Documentation.

Footer line:

```text
Lastre is a proof-of-provenance layer. It confers no ownership, no financial right, and offers no security, token sale, or yield.
```

## Motion constraints

- Respect `prefers-reduced-motion`.
- Animate transform/opacity, not layout properties.
- Avoid bounce/elastic easing.
- Do not animate live counters in a way that hides the actual value.

## Copy blacklist

Do not use:

```text
invest, buy, sell, yield, return, ROI, profit, price, market cap, ownership, fractional ownership, passive income, token sale
```
