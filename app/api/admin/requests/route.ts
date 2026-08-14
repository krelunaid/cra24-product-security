import { ensureBetaSchema } from "../../../../db/beta";
import { ensureDemoSchema, getDemoDatabase, isOwnerEmail, setBetaAccess } from "../../../../db/demo";
import { consumeRateLimit, ensureSecuritySchema, identifierHash } from "../../../../db/security";
import { cleanSingleLine, hasContentType, isSameOriginRequest, isValidProfessionalEmail, normalizeEmail, parseRequiredContentLength } from "../../../../lib/security";
import { getChatGPTUserFromHeaders } from "../../../chatgpt-auth";

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    if (!isSameOriginRequest(request)) return Response.json({ error: "Origine non valida." }, { status: 403 });
    if (!hasContentType(request, "application/x-www-form-urlencoded")) return Response.json({ error: "Formato richiesta non valido." }, { status: 415 });
    const size = parseRequiredContentLength(request, 4096);
    if (!size.ok) return Response.json({ error: size.error }, { status: size.status });
    const user = getChatGPTUserFromHeaders(request.headers);
    if (!user || !isOwnerEmail(user.email)) return Response.json({ error: "Non autorizzato." }, { status: 403 });

    const database = getDemoDatabase();
    await ensureBetaSchema(database);
    await ensureDemoSchema(database);
    await ensureSecuritySchema(database);
    const actorHash = await identifierHash(user.userId, "admin-actions");
    const limit = await consumeRateLimit(database, "admin-actions-5m", actorHash, 40, 5 * 60);
    if (!limit.allowed) return Response.json({ error: "Troppe operazioni. Riprova tra poco." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });

    const form = await request.formData();
    const email = normalizeEmail(form.get("email"));
    const action = cleanSingleLine(form.get("action"), 20);
    if (!isValidProfessionalEmail(email) || !["approve", "revoke"].includes(action)) {
      return Response.json({ error: "Richiesta non valida." }, { status: 400 });
    }

    const requestId = cleanSingleLine(request.headers.get("cf-ray"), 120) || crypto.randomUUID();
    await setBetaAccess(database, email, action === "approve", {
      actorUserId: user.userId,
      actorEmail: user.email,
      requestId,
    });
    return Response.redirect(new URL(`/richieste?updated=${action}`, requestUrl.origin), 303);
  } catch {
    console.error(JSON.stringify({ event: "beta_access_update_failed", requestId: request.headers.get("cf-ray") ?? "local" }));
    return Response.redirect(new URL("/richieste?updated=error", requestUrl.origin), 303);
  }
}
