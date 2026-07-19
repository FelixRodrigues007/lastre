# Lastre — Content Kit + FAQ Telegram (Casper stakeholders)

**Data:** 2026-07-19  
**Audiência:** admins TG (`@Jamesbriton`, `@davidatwhiletrue`, `@Alfirins`), ecosystem (`@Tamcarmel`), content (Berkay), eng (Ed Hastings), CTO (Michael)  
**Regra de ouro:** útil primeiro · zero shill · honesty mock vs settle · não claim ranking oficial  

---

## 1. Links vivos (copiar/colar)

| O quê | URL |
|-------|-----|
| Landing | https://lastre.io |
| App | https://app.lastre.io |
| Marketplace demo | https://app.lastre.io/marketplace |
| Agents | https://app.lastre.io/agents |
| API health | https://app-api.lastre.io/api/health |
| Evidence pack | https://app-api.lastre.io/api/evidence |
| Autonomy | https://app-api.lastre.io/api/agent/autonomy |
| Demo video | https://youtu.be/UzhKMsKA6QE |
| Dev TG (oficial Casper) | https://t.me/CSPRDevelopers |
| x402 facilitator (MAKE) | https://docs.cspr.cloud/x402-facilitator-api/reference |
| x402 examples | https://github.com/make-software/casper-x402 |

**Sample settle real (prod 2026-07-19, native CSPR 2.5 transfer):**  
https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6  

**Honesty:** native CSPR via CasperFacilitator (`casper_deploy`). MAKE path WCSPR+CSPR.cloud = optional next.

---

## 2. Mensagem única TG — “community pack” (pronto para postar)

Use **só** se pedirem o projeto, ou após ser útil numa thread (ex. x402). Não flood.

```
Lastre — origin trust layer for hard RWAs on Casper

Proof before token: dual-key sealer ≠ attester. Seal decides Valid/Invalid (LLM only chooses pay / skip / escalate). Invalid is permanent on-chain proof — MintGate refuses mint without Valid ProofOfOrigin.

Live:
• App: https://app.lastre.io/marketplace  (Run Demo)
• Evidence: https://app-api.lastre.io/api/evidence
• Health: https://app-api.lastre.io/api/health  (x402 facilitatorMode=casper)
• Autonomy: https://app-api.lastre.io/api/agent/autonomy

Honesty: judge UI simulate = mock receipt; production API settles real testnet CSPR (native transfer).
Sample settle: https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6
(MAKE WCSPR + CSPR.cloud path = optional next — we already move real testnet value.)

Not an oracle marketplace. Agents pay for provenance, not for fake counters.
```

**Versão micro (reply rápido):**

```
Lastre = proof before token on Casper (dual-key + Invalid-as-proof + MintGate).
Demo: https://app.lastre.io/marketplace | Evidence: https://app-api.lastre.io/api/evidence
UI simulate is mock by design; API can run casper settle. Happy to share settle tx when we post the WCSPR path sample.
```

---

## 3. FAQ curto TG (quando alguém perguntar)

### “O que é o Lastre?”
> Provenance / origin trust layer: before mint or agent action, the seal decides Valid or Invalid on Casper. Agents can pay via x402 to read proof.

### “É x402 real ou mock?”
> Both paths exist. Judge UI / simulate uses mock facilitator (synthetic receipt, no CSPR moved). Production API uses `facilitatorMode=casper` and moves **real testnet CSPR** (native transfer). Sample: https://testnet.cspr.live/transaction/4caa70467db2f1d6088df150c524f362765d48bfef8b54e2e98d1531304991f6 — Official MAKE path (WCSPR + CSPR.cloud facilitator) is optional next; jury can already verify on-chain payment.

### “Dual-key?”
> Field sealer builds the offline SHA-256 seal. Chain attester is a different key writing Valid/Invalid. Sealer ≠ attester — separation of duties / access control for origin.

### “Invalid falhou?”
> No — Invalid is intentional evidence. We write rejected proofs on-chain so agents and MintGate can refuse bad assets. Not a failed UX.

### “Vs Claros / oracles?”
> Different layer. Oracles densify feeds. Lastre is the origin gate under mint/pay: proof before token. We don’t farm fake marketplace counters.

### “Mainnet?”
> Testnet evidence live today. Mainnet when settlement + ops are safe — honest roadmap, not a claim of mainnet money now.

---

## 4. Content kit por stakeholder (headline + 3 bullets)

### Para James / Alfirins (CM — utilidade)
**Headline:** Builder pack — origin proof on Casper in 60s  
**Bullets:**
1. One demo link, no install  
2. Honest mock vs settle labels  
3. FAQ ready for the group  

### Para David H / MAKE (path técnico)
**Headline:** x402 provenance paywall on Casper rails  
**Bullets:**
1. HTTP 402 → pay → proof payload  
2. API `facilitatorMode=casper`; settle sample on WCSPR/CSPR.cloud path (when posted)  
3. Mock only for safe demo loops / autonomy cycles  

### Para Ed Hastings (eng — access rights)
**Headline:** Access control for mint: NoValidProof without dual-key Valid  
**Bullets:**
1. Sealer ≠ attester dual control  
2. Invalid is first-class on-chain state  
3. MintGate enforces Valid before mint (testnet package hash on evidence)  

### Para Michael (tese Manifest)
**Headline:** Constraints their owners require — on hard RWAs  
**Bullets:**
1. Carbon + mineral origin, tamper → Invalid  
2. Agent only pay/skip/escalate; seal decides truth  
3. Trust layer under agent economy, not another payment guardrail  

### Para Tamara (ecosystem / mainnet vibe)
**Headline:** Agentic RWA origin app built to launch beyond the hackathon  
**Bullets:**
1. 250+ field energy → we ship live API + evidence pack  
2. Path to mainnet: real settle + production ops (honest)  
3. Casperfam-friendly: open links, no fake ranking  

### Para Berkay (content — publishable)
**Headline:** “Seal decides. Agent only chooses.”  
**Visual cues:** Valid green / Invalid red / dual-key diagram / MintGate block / explorer link  
**Assets to deliver:**
- [ ] 30–60s vertical or landscape clip (Invalid blocks mint)  
- [ ] 1 still: evidence JSON `dualKey` + package hash  
- [ ] 1 still: marketplace Run Demo verdict  
- [ ] Caption 3 lines (EN) + optional PT  

**Caption EN (Berkay-ready):**
```
Proof before token on @Casper_Network.

Dual-key origin. Invalid is permanent proof. MintGate won’t mint without Valid.

Demo → app.lastre.io/marketplace
```

---

## 5. Quando postar no TG (ética)

| Situação | Ação |
|----------|------|
| Alguém pergunta x402 | Responder path MAKE **primeiro**; Lastre só se natural (“we use 402 for provenance”) |
| Pedem projetos / demos | Community pack completo |
| Settle tx novo | 1 post limpo com hash + honesty |
| Nunca | Flood, “vote em nós”, claim #1 Dora, mainnet money fake |

---

## 6. Checklist pré-envio

- [ ] health `ok:true`  
- [ ] evidence carrega  
- [ ] Run Demo funciona  
- [ ] Texto distingue mock UI vs casper API  
- [ ] Sem ranking oficial / sem mainnet money claim  
- [ ] Se citar settle: hash real no explorer  

---

## Ver também

- Enchantment map: [`CASPER_ENCHANTMENT_MAP_2026-07-19.md`](./CASPER_ENCHANTMENT_MAP_2026-07-19.md)  
- Elevação de entrega: [`DELIVERY_LEVEL_UP_2026-07-19.md`](./DELIVERY_LEVEL_UP_2026-07-19.md)  
- Demo 5 min: [`DEMO_DAY_SCORECARD_5MIN.md`](./DEMO_DAY_SCORECARD_5MIN.md)  
- Judge one-pager: [`JUDGE_ONE_PAGER.md`](./JUDGE_ONE_PAGER.md)  
