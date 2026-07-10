# Lastre Brand and Domain Plan

## Brand decision

The public solution name is **Lastre**.

The existing repository, deployed gateway, Rust crates, npm package names, CSS
variables, and contract paths may still contain `lastro` while the migration is
in progress. This is intentional. Renaming deployed contract paths or package
names in one pass risks breaking builds, imports, Docker images, and operational
scripts.

## Naming standard

| Context | Use |
|---|---|
| Public product, website, pitch, UI copy | `Lastre` |
| Domain | `lastre.io` |
| GitHub repository URL | Use `FelixRodrigues007/lastre`; legacy local/package paths may still use `lastro` |
| Contract path | Keep `contracts/lastro_origin` for now |
| CSS variables | Keep `--lastro-*` for now |
| NPM packages | Keep `@lastro/*` for now |
| Gateway URL today | `https://lastro.onrender.com` |
| Gateway URL future | `https://api.lastre.io` |

## Domain architecture

Recommended DNS and hosting map:

| Host | Target | Purpose |
|---|---|---|
| `lastre.io` | Vercel production project | Public landing and frontend app |
| `www.lastre.io` | Vercel redirect or alias | Optional canonical redirect to apex |
| `api.lastre.io` | Render custom domain | Gateway JSON API, future replacement for `lastro.onrender.com` |
| `docs.lastre.io` | Optional Vercel/docs route | Future public docs surface |
| `status.lastre.io` | Optional status provider | Future uptime/status page |

Canonical URL for public materials:

```text
https://lastre.io
```

## Vercel configuration

Project: `lastro` today, public brand **Lastre**.

Environment variables:

```text
VITE_GATEWAY_URL=https://lastro.onrender.com
VITE_PUBLIC_SITE_URL=https://lastre.io
```

Once `api.lastre.io` is mapped to Render, update:

```text
VITE_GATEWAY_URL=https://api.lastre.io
```

## Render CORS configuration

Until custom API domain is ready:

```text
ALLOWED_ORIGINS=https://lastre.io,https://www.lastre.io,https://*.vercel.app,http://localhost:5173,http://localhost:3000
```

Keep `https://*.vercel.app` while temporary Vercel production/preview URLs are
used. Remove it only after `lastre.io` is the sole public testing surface.

## SEO baseline

Recommended production metadata:

```text
Title: Lastre — Proof before token.
Description: Lastre verifies physical provenance offline with deterministic SHA-256 seals and anchors both Valid and Invalid verdicts on Casper.
Canonical: https://lastre.io
```

Robots: public indexing is acceptable only after every page carries the
demonstration banner and no prohibited financial language remains.

## Rebrand migration phases

### Phase 0 — Completed/active

- Public docs say Lastre.
- `lastre.io` is the domain.
- The app can still call `https://lastro.onrender.com`.
- Legacy internal `lastro` paths remain stable.

### Phase 1 — Public UI

- Update visible UI copy from Lastro to Lastre.
- Update HTML title and meta tags.
- Add `lastre.io` to Vercel.
- Add `lastre.io` to Render `ALLOWED_ORIGINS`.

### Phase 2 — API domain

- Add `api.lastre.io` as a Render custom domain.
- Change Vercel `VITE_GATEWAY_URL` to `https://api.lastre.io`.
- Keep `https://lastro.onrender.com` as operational fallback.

### Phase 3 — Internal namespace migration, optional

Only after the hackathon/demo window:

- Rename npm scopes if desired.
- Rename contract folder only if all scripts and docs are updated.
- Rename CSS variables only if an automated codemod and visual regression pass
  exist.

Do not rename deployed contract identifiers as part of a public brand-only
change.
