import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { hasSameOrigin, isOwnerEmail, normalizeEmail, sanitizeDemoState } from "../db/demo-logic.ts";

const projectRoot = new URL("../", import.meta.url);
const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const assets = { fetch: async () => new Response("Not found", { status: 404 }) };

function authHeaders(email, userId, fullName = "Test User") {
  return {
    "oai-authenticated-user-id": userId,
    "oai-authenticated-user-email": email,
    "oai-authenticated-user-full-name": encodeURIComponent(fullName),
    "oai-authenticated-user-full-name-encoding": "percent-encoded-utf-8",
  };
}

async function request(path = "/", { authenticated = true, email = "andreagadducci@icloud.com", userId = "owner-test", fullName = "Andrea Test", method = "GET", headers = {}, body } = {}) {
  const requestHeaders = {
    accept: "text/html",
    host: "cra24.kreluna.it",
    "x-forwarded-proto": "https",
    ...headers,
  };
  if (authenticated) Object.assign(requestHeaders, authHeaders(email, userId, fullName));
  return worker.fetch(
    new Request(`https://cra24.kreluna.it${path}`, { method, headers: requestHeaders, body }),
    { ASSETS: assets },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the premium CRA24 public website", async () => {
  const response = await request("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Dalla vulnerabilità alle macchine coinvolte/);
  assert.match(html, /Una CVE è solo l.inizio/);
  assert.match(html, /CRA indica il regolamento/);
  assert.match(html, /Una demo onesta/);
  assert.match(html, /by Kreluna/);
  assert.match(html, /href="\/accesso"/);
  assert.match(html, /href="\/richiedi-beta"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("renders the beta, privacy and confirmation journey", async () => {
  const beta = await request("/richiedi-beta");
  const privacy = await request("/privacy");
  const thanks = await request("/grazie");
  assert.equal(beta.status, 200);
  assert.equal(privacy.status, 200);
  assert.equal(thanks.status, 200);
  assert.match(await beta.text(), /Descrivi il tuo caso/);
  assert.match(await privacy.text(), /sandbox beta/);
  assert.match(await thanks.text(), /Richiesta ricevuta/);
});

test("validates and limits every persisted sandbox field", () => {
  const state = sanitizeDemoState({
    version: 1,
    incidents: [{ id: 4, cve: "  CVE-TEST-4  ", title: "T".repeat(300), component: "HMI", version: "1", severity: "Alta", status: "Triage", detected: "Ora", serials: 1, customers: 1, owner: "Tester", progress: 140, summary: "Synthetic" }],
    assets: [{ id: "SYN-1", model: "Demo", customer: "Fittizio", site: "Demo", release: "1", exposure: "Nessuna", status: "Non esposto", selected: true }],
    settings: { humanApproval: true, escalation: false },
    tourSeen: true,
  });
  assert.equal(state.incidents[0].cve, "CVE-TEST-4");
  assert.equal(state.incidents[0].title.length, 180);
  assert.equal(state.incidents[0].progress, 100);
  assert.equal("selected" in state.assets[0], false);
  assert.equal(state.settings.escalation, false);
  assert.throws(() => sanitizeDemoState({ version: 1, incidents: [], assets: [] }), /incompleto/);
  assert.throws(() => sanitizeDemoState({ version: 1, incidents: [{ severity: "Invalid" }], assets: [{}] }), /non valido/);
});

test("normalizes approval identity and rejects cross-origin writes", () => {
  assert.equal(normalizeEmail("  Tester@Example.COM "), "tester@example.com");
  assert.equal(isOwnerEmail("ANDREAGADDUCCI@ICLOUD.COM"), true);
  assert.equal(isOwnerEmail("other@example.com"), false);
  assert.equal(hasSameOrigin("https://cra24.kreluna.it/api/demo-state", "https://cra24.kreluna.it"), true);
  assert.equal(hasSameOrigin("https://cra24.kreluna.it/api/demo-state", "https://evil.example"), false);
  assert.equal(hasSameOrigin("https://cra24.kreluna.it/api/demo-state", null), false);
});

test("ships finished metadata, persistence, consent-gated measurement and no preview code", async () => {
  const [home, accessPage, demo, layout, app, stateRoute, demoDb, adminRoute, hosting, packageJson, metaPixel, betaForm, privacy] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/accesso/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CRA24App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/api/demo-state/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../db/demo.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/admin/requests/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/MetaPixel.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/BetaRequestForm.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/privacy/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(home, /MarketingShell/);
  assert.match(accessPage, /Entra nella beta privata/);
  assert.match(accessPage, /CRA24 non riceve né conserva la password/);
  assert.match(accessPage, /chatGPTSignInPath/);
  assert.doesNotMatch(accessPage, /type=["']password/);
  assert.match(demo, /requireChatGPTUser/);
  assert.match(demo, /getDemoAccess/);
  assert.match(layout, /cra24\.kreluna\.it/);
  assert.match(app, /Demo guidata/);
  assert.match(app, /\/api\/demo-state/);
  assert.doesNotMatch(app, /sessionStorage/);
  assert.match(stateRoute, /getChatGPTUser/);
  assert.match(stateRoute, /getDemoAccess/);
  assert.match(stateRoute, /content-length/);
  assert.match(stateRoute, /hasSameOrigin/);
  assert.match(demoDb, /WHERE user_id = \?1 AND status = 'active'/);
  assert.match(demoDb, /UPDATE demo_access[\s\S]*WHERE email = \?2 AND status = 'active' AND user_id IS NULL/);
  assert.match(adminRoute, /isOwnerEmail/);
  assert.match(hosting, /"d1": "DB"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(layout, /MetaPixel/);
  assert.match(metaPixel, /cra24_meta_tracking_consent_v1/);
  assert.match(metaPixel, /consent !== "accepted"/);
  assert.match(metaPixel, /ViewContent/);
  assert.match(metaPixel, /Lead/);
  assert.doesNotMatch(metaPixel, /<noscript|tr\?id=/);
  assert.match(betaForm, /LEAD_MARKER_KEY/);
  assert.match(privacy, /Pixel Meta non viene caricato/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
