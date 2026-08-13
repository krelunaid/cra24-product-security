# CRA24

CRA24 is Kreluna's public product site and guided product-security operations demo.

## Routes

- `/` — public product website
- `/demo` — interactive synthetic CRA24 scenario
- `/richiedi-beta` — beta application form
- `/grazie` — submission confirmation
- `/privacy` — beta-request privacy notice
- `/richieste` — owner-only beta request inbox using Sign in with ChatGPT
- `/api/beta` — validated D1-backed form endpoint

The public demo never connects to real machines or external systems. Its data is synthetic and its changes are kept only for the current browser session.

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
