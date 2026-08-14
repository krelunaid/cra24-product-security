/** Cloudflare Worker entry point for the vinext-starter template. */
import handler from "vinext/server/app-router-entry";
import { acquireMaintenanceLease, ensureSecuritySchema, purgeExpiredProjectData } from "../db/security";

interface Env {
  ASSETS: Fetcher;
  DB?: D1Database;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

const marketingPaths = new Set(["/", "/richiedi-beta", "/grazie", "/privacy"]);
let lastMaintenanceStartedAt = 0;

function contentSecurityPolicy(pathname: string) {
  const marketing = marketingPaths.has(pathname.replace(/\/$/, "") || "/");
  const scriptSources = marketing
    ? "'self' 'unsafe-inline' https://connect.facebook.net"
    : "'self' 'unsafe-inline'";
  const connectSources = marketing
    ? "'self' https://connect.facebook.net https://www.facebook.com"
    : "'self'";
  const imageSources = marketing
    ? "'self' data: https://www.facebook.com"
    : "'self' data:";
  const frameSources = marketing ? "https://www.facebook.com" : "'none'";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSources}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imageSources}`,
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    `frame-src ${frameSources}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function appendVary(headers: Headers, value: string) {
  const current = headers.get("vary");
  const values = new Set((current ? current.split(",") : []).map((item) => item.trim()).filter(Boolean));
  values.add(value);
  headers.set("vary", [...values].join(", "));
}

function secureResponse(response: Response, pathname: string) {
  const secured = new Response(response.body, response);
  secured.headers.set("content-security-policy", contentSecurityPolicy(pathname));
  secured.headers.set("x-frame-options", "DENY");
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  secured.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()");
  secured.headers.set("strict-transport-security", "max-age=31536000; includeSubDomains");
  secured.headers.set("x-permitted-cross-domain-policies", "none");

  if (pathname === "/accesso" || pathname === "/demo" || pathname === "/richieste" || pathname.startsWith("/api/") || pathname.startsWith("/signin-with-chatgpt") || pathname.startsWith("/callback")) {
    secured.headers.set("cache-control", "private, no-store, max-age=0");
    secured.headers.set("pragma", "no-cache");
    secured.headers.set("cross-origin-resource-policy", "same-origin");
    appendVary(secured.headers, "Cookie");
    appendVary(secured.headers, "oai-authenticated-user-id");
    appendVary(secured.headers, "oai-authenticated-user-email");
  }

  if ((secured.headers.get("content-type") ?? "").includes("text/html")) {
    secured.headers.set("cross-origin-opener-policy", "same-origin");
  }
  return secured;
}

async function runMaintenance(database: D1Database) {
  await ensureSecuritySchema(database);
  if (!(await acquireMaintenanceLease(database))) return;
  await purgeExpiredProjectData(database);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (env.DB && Date.now() - lastMaintenanceStartedAt > 6 * 60 * 60 * 1000) {
      lastMaintenanceStartedAt = Date.now();
      ctx.waitUntil(runMaintenance(env.DB).catch(() => {
        console.error(JSON.stringify({ event: "cra24_maintenance_failed" }));
      }));
    }

    try {
      return secureResponse(await handler.fetch(request, env, ctx), url.pathname);
    } catch {
      const requestId = request.headers.get("cf-ray") ?? crypto.randomUUID();
      console.error(JSON.stringify({
        event: "cra24_unhandled_request_error",
        requestId,
        method: request.method,
        path: url.pathname,
      }));
      const response = url.pathname.startsWith("/api/")
        ? Response.json({ error: "Errore interno.", requestId }, { status: 500 })
        : new Response("Servizio temporaneamente non disponibile.", { status: 500 });
      return secureResponse(response, url.pathname);
    }
  },
};

export default worker;
