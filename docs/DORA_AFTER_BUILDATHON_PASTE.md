# Dora BUIDL — paste block: After-buildathon / roadmap

Copy into the BUIDL description (or “After-buildathon” section).  
Markdown-friendly; avoid GFM tables if Dora breaks them.

---

## After Buildathon Finals

**Full roadmap (repo):**  
https://github.com/FelixRodrigues007/lastre/blob/main/docs/POST_BUILDATHON_ROADMAP.md

**Today (Final Round):**  
Lastre runs on **Casper Testnet** only. Sealed Market Rail, dual-key origin, Invalid-as-proof, MintGate. UI simulate paths are mock; real value movement only via testnet settle APIs when keys are present. **No mainnet money claims in the demo.**

**Thesis (precise):**  
**Proof before token. Proof before finance.**  
Origin seal decides Valid/Invalid. Agents may pay/skip/escalate for provenance — they never rewrite the seal.  
This is **not** a generic “proof of concept” for tokenization.

**After Finals close we execute a gated plan:**

1. **Production completion** — demo vs prod freeze, ops smoke, field sealer runbook.  
2. **Operator feasibility** — real physical lots (industrial corridors). Pilot only if documentation is real. Unit of proof = **lot**, not “tokenize the whole mine on day one.”  
3. **Load and capacity testing on Testnet** — design for institutional RWA corridor scale (multi-billion USD **asset-flow class** as design target — not a claim of current processed volume).  
4. **Multi-site RWA + precision field geolocation** — chain-of-custody from field capture → seal → Casper → gate.  
5. **Phased mainnet readiness** — mainnet only when these gates are green: keys, facilitator/settle ops, monitoring, incident runbook, contract policy, legal review. First mainnet step = minimal ProofOfOrigin / evidence path — not finance theater.

**One-liner:**  
Live on Casper Testnet today. Mainnet when facilitator ops + keys + monitoring are production-safe. No mainnet money claims in demo.

**Live:**  
- App rail: https://app.lastre.io/marketplace?rail=1  
- Evidence: https://app-api.lastre.io/api/evidence  
- Repo roadmap: https://github.com/FelixRodrigues007/lastre/blob/main/docs/POST_BUILDATHON_ROADMAP.md
