# CRA24

CRA24 is Kreluna's public product site and private, guided product-security operations sandbox.

## Routes

- `/` — public product website
- `/accesso` — Sign in with ChatGPT entry point for approved testers
- `/demo` — private, interactive synthetic CRA24 scenario
- `/richiedi-beta` — beta application form
- `/grazie` — submission confirmation
- `/privacy` — beta-request privacy notice
- `/richieste` — owner-only beta request inbox using Sign in with ChatGPT
- `/api/beta` — validated D1-backed form endpoint
- `/api/demo-state` — per-user, revision-protected sandbox persistence
- `/api/admin/requests` — owner-only approval and revocation endpoint

The sandbox never connects to real machines or external systems. Its sample data is synthetic. Approved users authenticate through the Sites-owned Sign in with ChatGPT flow; CRA24 never receives their password. Authorization is checked again on every private request, and each workspace is isolated by the stable authenticated user ID.

## Security model

- The marketing site remains public; `/demo`, `/richieste` and their APIs fail closed without authenticated authorization.
- Beta submissions require same-origin JSON requests, bounded bodies, strict input validation, atomic deduplication and D1-backed rate limits.
- Administrative approvals are same-origin, owner-only, rate-limited and recorded in an audit log.
- Global browser protections include CSP, anti-framing, HSTS, MIME sniffing protection, restrictive referrer and permissions policies.
- Meta Pixel is consent-gated and technically limited to marketing pages. It never loads in access, sandbox, administration or API routes.
- Sandbox state uses a bounded allowlist schema and optimistic revisions. Conflicts stop automatic writes instead of silently overwriting another tab.
- CSV import is limited to 1 MB and 500 rows; CSV exports neutralize spreadsheet formulas.
- Access expires after 90 days. Traffic-triggered maintenance removes stale requests, workspaces, rate-limit records and audit entries under the documented retention rules.

The production security boundary assumes the Sites dispatcher strips and sets `oai-authenticated-*` headers. Do not expose the Worker through a direct `workers.dev` or alternate origin without replacing this trust boundary with independently verified tokens or Cloudflare Access.

## Local development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm test
```

## Persistence

Beta requests use the `DB` D1 binding declared in `.openai/hosting.json`. The schema lives in `db/schema.ts`; generated migrations are kept under `drizzle/`.
