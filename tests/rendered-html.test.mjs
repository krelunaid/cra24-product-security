import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render(path = "/", { authenticated = true } = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  const requestHeaders = { accept: "text/html", host: "cra24.kreluna.it", "x-forwarded-proto": "https" };
  if (authenticated) {
    requestHeaders["oai-authenticated-user-id"] = "test-user-123";
    requestHeaders["oai-authenticated-user-email"] = "andrea@example.com";
    requestHeaders["oai-authenticated-user-full-name"] = "Andrea%20Test";
    requestHeaders["oai-authenticated-user-full-name-encoding"] = "percent-encoded-utf-8";
  }

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: requestHeaders }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the premium CRA24 public website", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Dalla vulnerabilità alle macchine coinvolte/);
  assert.match(html, /Una CVE è solo l.inizio/);
  assert.match(html, /CRA indica il regolamento/);
  assert.match(html, /Una demo onesta/);
  assert.match(html, /by Kreluna/);
  assert.match(html, /href="\/demo"/);
  assert.match(html, /href="\/richiedi-beta"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps the full CRA24 product workspace at /demo", async () => {
  const response = await render("/demo");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Centro operativo/);
  assert.match(html, /CVE-2026-48312/);
  assert.match(html, /Seriali nello scenario/);
  assert.match(html, /CRA Article 14/);
  assert.match(html, /Dataset dimostrativo/);
  assert.match(html, /Aster Packaging · fittizia/);
  assert.match(html, /Andrea Test/);
  assert.match(html, /andrea@example\.com/);
  assert.match(html, /by Kreluna/);
});

test("lets anonymous prospects open the public demo without signing in", async () => {
  const response = await render("/demo", { authenticated: false });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Visitatore demo/);
  assert.match(html, /Accesso pubblico/);
  assert.match(html, /Nessun account richiesto/);
  assert.doesNotMatch(html, /Esci dall.account/);
});

test("renders the beta, privacy and confirmation journey", async () => {
  const beta = await render("/richiedi-beta");
  const privacy = await render("/privacy");
  const thanks = await render("/grazie");
  assert.equal(beta.status, 200);
  assert.equal(privacy.status, 200);
  assert.equal(thanks.status, 200);
  assert.match(await beta.text(), /Descrivi il tuo caso/);
  assert.match(await privacy.text(), /Informativa sul trattamento dei dati/);
  assert.match(await thanks.text(), /Richiesta ricevuta/);
});

test("ships finished metadata, real beta persistence and no preview code", async () => {
  const [home, demo, layout, app, betaRoute, hosting, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CRA24App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/beta/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(home, /MarketingShell/);
  assert.match(demo, /CRA24App/);
  assert.match(demo, /getChatGPTUser/);
  assert.match(layout, /cra24\.kreluna\.it/);
  assert.match(layout, /Product Security Operations/);
  assert.match(app, /Demo guidata/);
  assert.match(app, /Importa CSV locale/);
  assert.match(app, /Genera dossier demo/);
  assert.match(app, /Approvazione umana obbligatoria/);
  assert.match(app, /Nessun timer reale/);
  assert.match(betaRoute, /INSERT INTO beta_requests/);
  assert.match(hosting, /"d1": "DB"/);
  assert.doesNotMatch(app, /Dati sincronizzati|Ultimo sync|Timer attivo|Dossier firmato|Responsabile notificato/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
