# Security Policy

## Scope

This repository contains a demonstration proof-of-provenance stack with Casper
Testnet contracts, a Render gateway, and a Vercel frontend.

## Reporting security issues

Do not open a public issue for suspected secrets exposure, key handling problems,
or vulnerabilities that could affect deployed infrastructure.

Report vulnerabilities privately to Felix Rodrigues before disclosure:

- GitHub owner: `@FelixRodrigues007`
- Security contact: `FelixRodrigues007` through the repository owner profile/contact channel
- If you already have the buildathon contact email, use that same private thread

Do not post secrets, keys, dashboard links, or exploit details in public issues.

## Secret handling rules

Never commit:

- Casper secret keys;
- deployer keys;
- sandbox demo keys;
- xAI or OpenRouter API keys (XAI_API_KEY / OPENROUTER_API_KEY);
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
