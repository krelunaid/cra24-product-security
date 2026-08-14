import { consumeRateLimit, ensureSecuritySchema, identifierHash, requestActorHash } from "../../../db/security";
import {
  cleanMultiline,
  cleanSingleLine,
  hasContentType,
  isSameOriginRequest,
  isValidProfessionalEmail,
  normalizeEmail,
  normalizeWebsite,
  parseRequiredContentLength,
} from "../../../lib/security";

const priorities = new Set([
  "Documentazione tecnica",
  "Vulnerabilità",
  "SBOM e componenti",
  "Gestione fornitori",
  "Scadenze e notifiche",
  "Altro",
]);

const maximumBodyBytes = 16_384;
const responseHeaders = { "cache-control": "private, no-store, max-age=0" };

function json(payload: Record<string, unknown>, status: number, extraHeaders?: Record<string, string>) {
  return Response.json(payload, { status, headers: { ...responseHeaders, ...extraHeaders } });
}

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return json({ error: "Origine non valida." }, 403);
    if (!hasContentType(request, "application/json")) return json({ error: "Formato richiesta non valido." }, 415);
    const size = parseRequiredContentLength(request, maximumBodyBytes);
    if (!size.ok) return json({ error: size.error }, size.status);

    const { ensureBetaSchema, getBetaDatabase } = await import("../../../db/beta");
    const database = getBetaDatabase();
    await ensureSecuritySchema(database);
    const [actor, globalActor] = await Promise.all([
      requestActorHash(request, "beta"),
      identifierHash("all-submitters", "beta-global"),
    ]);
    const [shortLimit, dailyLimit] = await Promise.all([
      consumeRateLimit(database, "beta-ip-15m", actor, 8, 15 * 60),
      consumeRateLimit(database, "beta-ip-day", actor, 30, 24 * 60 * 60),
    ]);
    if (!shortLimit.allowed || !dailyLimit.allowed) {
      const retryAfter = Math.max(shortLimit.allowed ? 0 : shortLimit.retryAfter, dailyLimit.allowed ? 0 : dailyLimit.retryAfter);
      return json(
        { error: "Troppe richieste. Riprova più tardi oppure scrivi a cra24@kreluna.it." },
        429,
        { "retry-after": String(retryAfter) },
      );
    }
    const globalLimit = await consumeRateLimit(database, "beta-global-15m", globalActor, 300, 15 * 60);
    if (!globalLimit.allowed) {
      return json(
        { error: "Il servizio sta ricevendo troppe richieste. Riprova più tardi." },
        429,
        { "retry-after": String(globalLimit.retryAfter) },
      );
    }

    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > maximumBodyBytes) return json({ error: "La richiesta supera il limite consentito." }, 413);
    let payload: Record<string, unknown>;
    try {
      const parsed = JSON.parse(rawBody) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new SyntaxError("Invalid object");
      payload = parsed as Record<string, unknown>;
    } catch {
      return json({ error: "Richiesta non valida." }, 400);
    }

    const fullName = cleanSingleLine(payload.fullName, 120);
    const company = cleanSingleLine(payload.company, 160);
    const email = normalizeEmail(payload.email);
    const role = cleanSingleLine(payload.role, 140);
    const productType = cleanSingleLine(payload.productType, 180);
    const priority = cleanSingleLine(payload.priority, 80);
    const website = normalizeWebsite(payload.website);
    const caseSummary = cleanMultiline(payload.caseSummary, 1800);
    const locale = cleanSingleLine(payload.locale, 12) || "it";
    const utmSource = cleanSingleLine(payload.utmSource, 120);
    const utmMedium = cleanSingleLine(payload.utmMedium, 120);
    const utmCampaign = cleanSingleLine(payload.utmCampaign, 160);
    const startedAt = Number(payload.startedAt);

    if (cleanSingleLine(payload.companyFax, 100)) {
      return json({ ok: true }, 202);
    }

    if (!fullName || !company || !isValidProfessionalEmail(email) || !role || !productType || !priorities.has(priority) || website === null) {
      return json({ error: "Controlla i campi obbligatori e riprova." }, 400);
    }

    if (payload.privacyAccepted !== true) {
      return json({ error: "È necessario prendere visione dell’informativa privacy." }, 400);
    }

    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 800 || Date.now() - startedAt > 86_400_000) {
      return json({ error: "La sessione del modulo è scaduta. Ricarica la pagina e riprova." }, 400);
    }

    const emailActor = await identifierHash(email, "beta-email");
    const emailLimit = await consumeRateLimit(database, "beta-email-day", emailActor, 4, 24 * 60 * 60);
    if (!emailLimit.allowed) {
      return json({ ok: true }, 202);
    }

    await ensureBetaSchema(database);
    await database
      .prepare(`
          INSERT INTO beta_requests (
            full_name, company, email, role, product_type, priority,
            website, case_summary, marketing_consent, locale,
            utm_source, utm_medium, utm_campaign
          )
          SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13
          WHERE NOT EXISTS (
            SELECT 1 FROM beta_requests
            WHERE email = ?3 AND created_at >= datetime('now', '-15 minutes')
          )
        `)
      .bind(
        fullName,
        company,
        email,
        role,
        productType,
        priority,
        website,
        caseSummary,
        payload.marketingConsent === true ? 1 : 0,
        locale,
        utmSource,
        utmMedium,
        utmCampaign,
      )
      .run();

    return json({ ok: true }, 202);
  } catch {
    console.error(JSON.stringify({ event: "beta_request_save_failed", requestId: request.headers.get("cf-ray") ?? "local" }));
    return json(
      { error: "Non è stato possibile registrare la richiesta. Puoi scrivere a cra24@kreluna.it." },
      500,
    );
  }
}
