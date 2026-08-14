import { ensureDemoSchema, getDemoAccess, getDemoDatabase } from "../../../db/demo";
import { consumeRateLimit, identifierHash } from "../../../db/security";
import { hasSameOrigin, sanitizeDemoState } from "../../../db/demo-logic";
import { hasContentType, parseRequiredContentLength } from "../../../lib/security";
import { getChatGPTUserFromHeaders } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "cache-control": "private, no-store, max-age=0",
  vary: "oai-authenticated-user-id, oai-authenticated-user-email",
};

async function authorize(request: Request) {
  const user = getChatGPTUserFromHeaders(request.headers);
  if (!user) return { error: Response.json({ error: "Accesso richiesto." }, { status: 401, headers: privateHeaders }) } as const;

  const database = getDemoDatabase();
  await ensureDemoSchema(database);
  const access = await getDemoAccess(database, user.email, user.userId);
  if (!access) return { error: Response.json({ error: "Accesso alla beta non abilitato." }, { status: 403, headers: privateHeaders }) } as const;
  const actorHash = await identifierHash(user.userId, "demo-api");
  const limit = await consumeRateLimit(database, "demo-api-5m", actorHash, 240, 5 * 60);
  if (!limit.allowed) {
    return { error: Response.json({ error: "Troppe operazioni. Riprova tra poco." }, { status: 429, headers: { ...privateHeaders, "retry-after": String(limit.retryAfter) } }) } as const;
  }
  return { user, database, access } as const;
}

export async function POST(request: Request) {
  try {
    if (!hasSameOrigin(request.url, request.headers.get("origin"), request.headers.get("sec-fetch-site"))) {
      return Response.json({ error: "Origine della richiesta non valida." }, { status: 403, headers: privateHeaders });
    }
    const auth = await authorize(request);
    if ("error" in auth) return auth.error;

    let existing = await auth.database
      .prepare(`
        SELECT user_id, email, company, state_json, revision, updated_at
        FROM demo_workspaces
        WHERE user_id = ?1
        LIMIT 1
      `)
      .bind(auth.user.userId)
      .first<{ user_id: string; email: string; company: string; state_json: string; revision: number; updated_at: string }>();

    if (!existing) {
      await auth.database
        .prepare(`
          INSERT INTO demo_workspaces (user_id, email, company)
          VALUES (?1, ?2, ?3)
          ON CONFLICT(user_id) DO NOTHING
        `)
        .bind(auth.user.userId, auth.user.email.toLowerCase(), auth.access.company)
        .run();
      existing = await auth.database
        .prepare(`
          SELECT user_id, email, company, state_json, revision, updated_at
          FROM demo_workspaces
          WHERE user_id = ?1
          LIMIT 1
        `)
        .bind(auth.user.userId)
        .first<{ user_id: string; email: string; company: string; state_json: string; revision: number; updated_at: string }>();
    }

    let state: unknown = null;
    if (existing?.state_json) {
      try {
        state = JSON.parse(existing.state_json);
      } catch {
        state = null;
      }
    }

    return Response.json({
      ok: true,
      company: auth.access.company,
      role: auth.access.role,
      state,
      savedAt: existing?.updated_at ?? null,
      revision: existing?.revision ?? 0,
    }, { headers: privateHeaders });
  } catch {
    console.error(JSON.stringify({ event: "demo_workspace_load_failed", requestId: request.headers.get("cf-ray") ?? "local" }));
    return Response.json({ error: "Non è stato possibile caricare la sandbox." }, { status: 500, headers: privateHeaders });
  }
}

export async function PUT(request: Request) {
  try {
    if (!hasSameOrigin(request.url, request.headers.get("origin"), request.headers.get("sec-fetch-site"))) return Response.json({ error: "Origine della richiesta non valida." }, { status: 403, headers: privateHeaders });
    if (!hasContentType(request, "application/json")) {
      return Response.json({ error: "Formato richiesta non valido." }, { status: 415, headers: privateHeaders });
    }

    const size = parseRequiredContentLength(request, 220_000);
    if (!size.ok) return Response.json({ error: size.error }, { status: size.status, headers: privateHeaders });

    const auth = await authorize(request);
    if ("error" in auth) return auth.error;
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 220_000) return Response.json({ error: "Lo scenario demo supera il limite consentito." }, { status: 413, headers: privateHeaders });
    const body = JSON.parse(rawBody) as { state?: unknown; revision?: unknown };
    const state = sanitizeDemoState(body.state);
    const stateJson = JSON.stringify(state);
    const revision = Number(body.revision);
    if (!Number.isInteger(revision) || revision < 0) return Response.json({ error: "Versione della sandbox non valida." }, { status: 400, headers: privateHeaders });

    const result = await auth.database
      .prepare(`
        UPDATE demo_workspaces
        SET email = ?1, company = ?2, state_json = ?3,
            revision = revision + 1, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?4 AND revision = ?5
      `)
      .bind(auth.user.email.toLowerCase(), auth.access.company, stateJson, auth.user.userId, revision)
      .run();
    if (!result.meta.changes) {
      return Response.json({ error: "La sandbox è stata aggiornata in un’altra scheda. Ricarica prima di salvare." }, { status: 409, headers: privateHeaders });
    }

    return Response.json({ ok: true, savedAt: new Date().toISOString(), revision: revision + 1 }, { headers: privateHeaders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stato demo non valido.";
    const status = error instanceof SyntaxError || /non valid|incompleto|limite/i.test(message) ? 400 : 500;
    if (status === 500) console.error(JSON.stringify({ event: "demo_workspace_save_failed", requestId: request.headers.get("cf-ray") ?? "local" }));
    return Response.json({ error: status === 400 ? message : "Non è stato possibile salvare la sandbox." }, { status, headers: privateHeaders });
  }
}
