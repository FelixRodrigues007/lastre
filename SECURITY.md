# Security Policy

## Scope

This repository contains a demonstration proof-of-provenance stack with Casper
Testnet contracts, a Render gateway, and a Vercel frontend.

## Reporting security issues

Do not open a public issue for suspected secrets exposure, key handling problems,
or vulnerabilities that could affect deployed infrastructure.

Contact the maintainers privately through the project owner before disclosure.

## Secret handling rules

Never commit:

- Casper secret keys;
- deployer keys;
- sandbox demo keys;
- OpenRouter/API keys;
- Vercel or Render tokens;
- `.env.local` files;
- private key paths that reveal local operational structure.

The public gateway must default to:

```text
SANDBOX_ANCHOR_ENABLED=false
```

Controlled write demos must use a low-balance demo account, SANDBOX-only asset
IDs, and environment variables supplied outside git.

## Supported surfaces

| Surface | Status |
|---|---|
| Casper Testnet contracts | Demo/prototype |
| Render gateway | Demo/prototype |
| Vercel frontend | Public demo |
| Mainnet / real assets | Not supported |

## Non-security bugs

Use the GitHub issue templates for regular bugs, docs requests, and frontend
work.
