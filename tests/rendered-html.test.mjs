import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

async function render({ authenticated = true } = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const requestHeaders = { accept: "text/html" };
  if (authenticated) {
    requestHeaders["oai-authenticated-user-id"] = "test-user-123";
    requestHeaders["oai-authenticated-user-email"] = "andrea@example.com";
    requestHeaders["oai-authenticated-user-full-name"] = "Andrea%20Test";
    requestHeaders["oai-authenticated-user-full-name-encoding"] = "percent-encoded-utf-8";
  }

  return worker.fetch(
    new Request("http://localhost/", {
      headers: requestHeaders,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the CRA24 product workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>CRA24 — Product Security Operations<\/title>/i);
  assert.match(html, /Centro operativo/);
  assert.match(html, /CVE-2026-48312/);
  assert.match(html, /Seriali monitorati/);
  assert.match(html, /CRA Article 14/);
  assert.match(html, /Andrea Test/);
  assert.match(html, /andrea@example\.com/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("redirects anonymous visitors to the platform sign-in flow", async () => {
  const response = await render({ authenticated: false });
  assert.ok([302, 303, 307, 308].includes(response.status));
  assert.match(response.headers.get("location") ?? "", /signin-with-chatgpt/);
  assert.match(response.headers.get("location") ?? "", /return_to/);
});

test("ships finished metadata and removes disposable preview code", async () => {
  const [page, layout, app, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/CRA24App.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /CRA24App/);
  assert.match(page, /requireChatGPTUser/);
  assert.match(layout, /Product Security Operations/);
  assert.match(app, /Importa seriali/);
  assert.match(app, /Genera dossier/);
  assert.match(app, /Approvazione umana obbligatoria/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await assert.rejects(access(new URL("app/_sites-preview", projectRoot)));
});
