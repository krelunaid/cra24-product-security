# CRA24 security operations

## Reporting

Report suspected vulnerabilities privately to `cra24@kreluna.it`. Do not include passwords, production machine data or customer data. Include the affected URL, time, expected result and minimal reproduction steps.

## Trust boundaries

- The production app must remain behind the OpenAI Sites dispatcher. It is trusted to remove attacker-supplied `oai-authenticated-*` headers and inject authenticated identity headers.
- Do not expose a `workers.dev`, preview or origin URL publicly. Before adding any alternate origin, replace dispatcher-header trust with a verifiable token or Cloudflare Access.
- Sign in with ChatGPT authenticates identity only. D1 access records authorize the beta separately, expire after 90 days and are rechecked for every private route and API call.
- The public sandbox accepts synthetic data only. A pilot with real company data requires a separate threat model, data-processing terms, tenant model, backup plan and security review.

## Deployment gates

Run all of the following before publication:

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm test
pnpm audit --prod
```

The full audit currently reports `image-size@2.0.2` through Vinext because the advisory names an unreleased `2.0.3` fix. CRA24 does not expose Vinext's image-optimization endpoint, does not import `next/image`, only processes repository-owned PNG metadata during the trusted build, and verifies that `image-size` is absent from `dist/server`. Upgrade immediately when Vinext publishes a dependency containing the patched release.

## Data recovery and retention

- Confirm D1 Time Travel is enabled for the production database and record whether the active plan provides a 7-day or 30-day recovery window.
- Before schema changes, take a tested export and document the restore command in the private operations runbook. Never commit exports to this repository.
- A D1 lease allows only one Worker isolate to run retention maintenance in each six-hour window. Maintenance is traffic-triggered; monitor its audit/Worker logs. If guaranteed wall-clock deletion is required, attach a Cloudflare Cron Trigger or Workflow before accepting real customer data.
- Rate-limit records are removed after two days. Requests, private workspaces and approval audit entries are removed under the periods documented in the privacy notice.

## Incident response

1. Revoke affected beta access in `/richieste`.
2. Preserve the relevant Cloudflare request IDs and the D1 approval audit entries; do not copy form content into logs.
3. Disable public beta submission if abuse is ongoing.
4. Rotate or remove any affected integration secret; CRA24 currently stores no application passwords.
5. Restore D1 only after preserving evidence and validating the target timestamp.
6. Patch, run the deployment gates, publish, and verify the custom domain plus the dispatcher identity boundary.
