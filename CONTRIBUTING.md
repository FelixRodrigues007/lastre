# Contributing to Lastre

Thank you for improving Lastre.

Lastre is a proof-of-provenance demo/protocol stack. Contributions must preserve
one core invariant:

> The deterministic seal decides the verdict. The UI, gateway, and LLM never
> overwrite `Valid` / `Invalid`.

## Development setup

```bash
git clone https://github.com/FelixRodrigues007/lastro.git
cd lastro
make setup
make build
make test
```

For the Vercel frontend only:

```bash
cd web
npm install
npm run build
npm run dev
```

## Contribution rules

- Use professional English in repo artifacts.
- Do not commit secrets, key paths, `.env.local`, or private dashboard tokens.
- Keep all public data fictional.
- Do not add investment/yield/return/price/buy/sell/ownership language.
- Label simulated and unverified states honestly.
- Do not rename deployed contract/package paths without a migration plan.
- Prefer small, reviewable commits.

## Before opening a PR

- [ ] `npm run build` passes in `web/` if frontend changed.
- [ ] Gateway tests pass if `agent/gateway` changed.
- [ ] Rust checks/tests pass if contracts changed.
- [ ] Public copy passes the product guardrails.
- [ ] Documentation is updated for any route/API behavior change.

## Documentation expectations

Update the relevant doc:

- routes: `docs/FRONTEND_ROUTES.md`
- API: `docs/API_CONTRACT.md`
- deployment: `docs/DEPLOYMENT_RUNBOOK.md`
- design/frontend: `docs/LAURA_FRONTEND_SYSTEM_DESIGN.md`
- roadmap: `docs/ROADMAP.md`

## Commit style

Use concise conventional-style messages:

```text
feat(web): add proof route
fix(gateway): handle unverified verdicts
docs: document lastre.io deployment
```
