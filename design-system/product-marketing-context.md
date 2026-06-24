# Product Marketing Context — Lastro

*Last updated: 2026-06-24*

## Product Overview
**One-liner:** Lastro is a proof-of-provenance protocol for tokenized real-world assets on Casper.

**What it does:** Lastro creates a deterministic chain of proof from physical origin to tokenization. An offline SHA-256 provenance seal is generated from a fictional provenance artifact, anchored on Casper through `ProofOfOrigin`, and later used by the agentic workflow to decide whether a lot is tokenizable or rejected.

**Product category:** RWA provenance infrastructure / trust layer / proof-of-origin protocol.

**Product type:** Protocol prototype and developer-facing infrastructure demo.

**Business model:** Not defined. Do not present Lastro as an investment product, yield product, marketplace, or financial return opportunity.

## Target Audience
**Target companies:** RWA builders, tokenization teams, compliance-minded blockchain teams, Casper ecosystem builders, hackathon judges, and technical evaluators.

**Decision-makers:** Protocol founders, CTOs, product leads, RWA platform operators, technical evaluators, compliance/risk stakeholders.

**Primary use case:** Demonstrate that a tokenization workflow can record both valid and invalid provenance outcomes on-chain instead of only posting a happy-path claim.

**Jobs to be done:**
- Prove that a physical-origin claim was checked before tokenization.
- Anchor a deterministic proof-of-origin result on Casper.
- Show that invalid provenance is recorded as permanent evidence, not discarded as an error.
- Separate deterministic verification from LLM-driven operational decisions.

**Use cases:**
- Hackathon demo of valid vs. tampered fictional lots.
- RWA provenance workflow explainer.
- Developer-facing proof-of-concept for Casper smart contracts and agentic orchestration.
- Trust-layer narrative for tokenization infrastructure.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---|---|---|---|
| RWA builder | Credible provenance before tokenization | Avoiding oracle theater and unverifiable claims | A concrete proof-before-token workflow |
| Technical evaluator | Real on-chain behavior and clear architecture | Distinguishing demo claims from working infrastructure | Testnet proof, deterministic seal, readable contracts |
| Compliance/risk stakeholder | Auditability and rejection evidence | Invalid data often disappears before becoming evidence | Both Valid and Invalid outcomes are recorded |
| Ecosystem/hackathon judge | Differentiated, Casper-native use case | Many projects only show superficial AI or token flows | Offline proof, Casper anchoring, x402 and agent orchestration |

## Problems & Pain Points
**Core problem:** Tokenized RWA demos often prove ownership or price, but not physical provenance.

**Why alternatives fall short:**
- They post API numbers or manually entered data.
- They treat AI as an authority instead of a workflow assistant.
- They often ignore the rejected path, leaving no permanent proof of failed provenance.

**What it costs them:** Lower trust, weaker audits, easier greenwashing, and tokenization flows that start after the most important physical-origin question has already been skipped.

**Emotional tension:** Skepticism: “How do I know this token actually traces back to the stated origin?”

## Competitive Landscape
**Direct:** RWA oracle/provenance approaches — may focus on price or claims rather than deterministic origin proof.

**Secondary:** Traditional audit documents — can be hard to automate, verify, or anchor in a composable workflow.

**Indirect:** Manual review — may be necessary but is slow and difficult to scale.

## Differentiation
**Key differentiators:**
- “Proof before token” narrative.
- Deterministic offline SHA-256 seal decides the verdict.
- LLM/agent only decides action, never truth.
- Both Valid and Invalid results are written on-chain.
- Built as a Casper-native prototype with Odra/Rust contracts.

**How we do it differently:** Lastro separates verification from orchestration: deterministic seals decide provenance validity; agents decide whether to pay, skip, or escalate.

**Why that's better:** It avoids turning an LLM into a truth oracle and makes rejection auditable.

**Why customers choose us:** They need a clear trust-layer story for RWA provenance, not another generic tokenization landing page.

## Objections
| Objection | Response |
|---|---|
| “Is this a financial product?” | No. Lastro is a proof/provenance layer. Avoid investment, yield, ROI, or return language. |
| “Does the LLM decide whether something is valid?” | No. The deterministic seal decides the verdict; the LLM only decides the action. |
| “Is this production-ready?” | No. It is an early prototype/demo using fictional data. |
| “Are these real mining/company records?” | No. All public samples are fictional. |

**Anti-persona:** Anyone looking for yield, investment returns, a token sale, or claims about real-world mining companies.

## Switching Dynamics
**Push:** RWA teams need more credible provenance than screenshots, PDFs, or price feeds.

**Pull:** A deterministic seal anchored on Casper creates a crisp proof-before-token story.

**Habit:** Teams default to manual docs, APIs, and token-first demos.

**Anxiety:** Concerns about on-chain complexity, data quality, and overclaiming AI capability.

## Customer Language
**How they describe the problem:**
- “We need proof before tokenization.”
- “The token is only as credible as the origin evidence behind it.”
- “AI should not be the source of truth.”

**How they describe us:**
- “A trust layer for RWA provenance.”
- “The chain of proof from land to token.”
- “Valid and invalid provenance are both recorded.”

**Words to use:** proof, provenance, origin, seal, attest, reject, anchor, deterministic, audit trail, trust layer, Casper.

**Words to avoid:** investment, yield, ROI, returns, profit, real mining company names, guaranteed, oracle truth, AI verified truth.

**Glossary:**
| Term | Meaning |
|---|---|
| Proof before token | Provenance must be checked before tokenization |
| Seal | Deterministic SHA-256 hash of a provenance artifact |
| Verdict | Valid/Invalid result from seal comparison |
| Action | Agent decision: pay, skip, or escalate |
| ProofOfOrigin | Casper contract that stores references and attestations |

## Brand Voice
**Tone:** Technical, credible, precise, restrained.

**Style:** Short proof-led claims, strong contrast, minimal hype, clear explanations.

**Personality:** Trustworthy, rigorous, grounded, forensic, infrastructure-grade.

## Proof Points
**Metrics:** Use only verified project facts, e.g. “Casper Testnet deployed” or “Valid and Invalid paths recorded,” when current.

**Customers:** None. Do not invent logos or real customers.

**Testimonials:** None.

**Value themes:**
| Theme | Proof |
|---|---|
| Deterministic truth | SHA-256 seal comparison decides verdict |
| On-chain accountability | Valid and Invalid results are recorded |
| Agentic separation | LLM decides action, never verdict |
| Casper-native | Odra/Rust contract deployed to Casper Testnet |

## Goals
**Business goal:** Communicate Lastro clearly as RWA provenance infrastructure.

**Conversion action:** Get technical audiences to review the repo/demo, understand the architecture, and engage with the prototype.

**Current metrics:** Not available.
