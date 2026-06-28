# Lastre Quality Checklist

Use this checklist before any public demo, recording, or deploy promotion.

## Product guardrails

- [ ] Every public screen shows `DEMONSTRATION — simulated assets, no investment offered`.
- [ ] No copy uses investment/yield/return/profit/price/buy/sell/ownership language.
- [ ] All assets are fictional or explicitly generic.
- [ ] `Valid` and `Invalid` are both described as recorded proof.
- [ ] The LLM/agent never decides or overwrites a verdict.
- [ ] Simulated lots are clearly labeled.

## Live proof

- [ ] `/proof` loads from the gateway.
- [ ] `/verdict/MINA-VALEDOURO-LOTE-001` displays `Invalid`.
- [ ] `/verdict/MINA-VALEDOURO-LOTE-002` displays `Valid`.
- [ ] Package hash is visible somewhere in proof/developer context.
- [ ] Transaction links open CSPR Live in a new tab.
- [ ] `Unverified` appears for missing attestation; no fake verdicts.

## Frontend UX

- [ ] Loading state is visible and does not look like zero data.
- [ ] Error state includes retry.
- [ ] `Refresh live verdicts` re-runs API calls.
- [ ] Hashes truncate safely and expose full value via copy/title/detail.
- [ ] Mobile layout has no horizontal overflow.
- [ ] Keyboard users can operate all controls.
- [ ] Focus states are visible.
- [ ] `prefers-reduced-motion` is respected.

## Accessibility

- [ ] Main text contrast meets WCAG AA.
- [ ] Verdict state is not communicated by color alone.
- [ ] Buttons have accessible names.
- [ ] Tables/lists have readable labels.
- [ ] Live updates use polite announcements where appropriate.

## Deploy

- [ ] `npm run build` passes in `web/`.
- [ ] Vercel production points to the intended commit.
- [ ] `lastre.io` opens in incognito.
- [ ] Render `/health` returns success.
- [ ] Render CORS allows `https://lastre.io`.
- [ ] No secrets, key paths, or `.env.local` files are committed.

## Spot-the-Fraud

- [ ] A round can be completed in under 25 seconds.
- [ ] The changed field is visible.
- [ ] The UI says the seal decides the verdict.
- [ ] Optional anchor is hidden/disabled unless SANDBOX demo mode is explicitly enabled.
