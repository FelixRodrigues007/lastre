# Lastre Operating Wheels

These are the repeatable loops that make the product, demo, and repository
stronger over time. They are not tokenomics or financial flywheels; they are
operational/product learning loops.

## 1. Proof wheel

```mermaid
flowchart LR
  field["Fictional field artifact"] --> seal["Deterministic seal"]
  seal --> attest["Casper attestation"]
  attest --> read["Free readback"]
  read --> explain["User understands proof"]
  explain --> field
```

Purpose: every demo reinforces the core thesis — proof before token.

## 2. Fraud-learning wheel

```mermaid
flowchart LR
  challenge["Generate challenge"] --> guess["User guesses fraud"]
  guess --> reveal["Reveal changed field"]
  reveal --> memory["User remembers tiny tamper -> new seal"]
  memory --> share["Demo becomes explainable"]
  share --> challenge
```

Purpose: Spot-the-Fraud makes deterministic verification memorable for judges,
users, and future contributors.

## 3. Design-system wheel

```mermaid
flowchart LR
  tokens["Tokens"] --> components["Components"]
  components --> pages["Routes/pages"]
  pages --> qa["QA checklist"]
  qa --> learn["Design learnings"]
  learn --> tokens
```

Purpose: Laura can improve the UI without breaking the protocol, copy guardrails,
or API integration.

## 4. Trust-boundary wheel

```mermaid
flowchart LR
  rule["Seal decides verdict"] --> docs["Docs + UI labels"]
  docs --> tests["QA + smoke tests"]
  tests --> demo["Public demo"]
  demo --> feedback["Review feedback"]
  feedback --> rule
```

Purpose: every release re-validates that the frontend does not invent trust.

## 5. Deployment wheel

```mermaid
flowchart LR
  commit["Git commit"] --> build["Vercel/Render build"]
  build --> smoke["Smoke tests"]
  smoke --> observe["Logs + Network"]
  observe --> fix["Small fix"]
  fix --> commit
```

Purpose: keep deploys boring, observable, and reversible.

## Practical cadence

| Cadence | Wheel | Output |
|---|---|---|
| Every UI change | Design-system wheel | components remain tokenized and accessible |
| Every deploy | Deployment wheel | smoke tests and rollback confidence |
| Every demo recording | Fraud-learning wheel | clear 15-second explanation |
| Every product edit | Trust-boundary wheel | no prohibited copy or fake verdicts |
| Every protocol change | Proof wheel | readback still proves accepted/rejected state |
