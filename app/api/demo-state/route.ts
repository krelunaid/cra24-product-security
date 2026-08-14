import { ensureDemoSchema, getDemoAccess, getDemoDatabase } from "../../../db/demo";
import { hasSameOrigin, sanitizeDemoState } from "../../../db/demo-logic";
import { getChatGPTUserFromHeaders } from "../../chatgpt-auth";

export const dynamic = "force-dynamic";

const privateHeaders = {
  "cache-control": "private, no-store, max-age=0",
  vary: "oai-authenticated-user-id, oai-authenticated-user-email",
};

async function purgeExpiredDemoData(database: D1Database) {
  await database.batch([
    database.prepare("DELETE FROM demo_workspaces WHERE updated_at < datetime('now', '-12 months')"),
    database.prepare(`
      DELETE FROM demo_access
      WHERE status != 'active' AND updated_at < datetime('now', '-12 months')
    `),
  ]);
}

async function authorize(request: Request) {
  const user = getChatGPTUserFromHeaders(request.headers);
  if (!user) return { error: Response.json({ error: "Accesso richiesto." }, { status: 401 }) } as const;

  const database = getDemoDatabase();
  await ensureDemoSchema(database);
  await purgeExpiredDemoData(database);
  const access = await getDemoAccess(database, user.email, user.userId);
  if (!access) return { error: Response.json({ error: "Accesso alla beta non abilitato." }, { status: 403 }) } as const;
  return { user, database, access } as const;
}

export async function POST(request: Request) {
  try {
    const auth = await authorize(request);
    if ("error" in auth) return auth.error;

    const existing = await auth.database
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
  } catch (error) {
    console.error("Unable to load CRA24 demo workspace", error);
    return Response.json({ error: "Non è stato possibile caricare la sandbox." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!hasSameOrigin(request.url, request.headers.get("origin"))) return Response.json({ error: "Origine della richiesta non valida." }, { status: 403 });
    if (!(request.headers.get("content-type") ?? "").toLowerCase().includes("application/json")) {
      return Response.json({ error: "Formato richiesta non valido." }, { status: 415 });
    }

    const contentLengthHeader = request.headers.get("content-length");
    const contentLength = Number(contentLengthHeader);
    if (!contentLengthHeader || !Number.isFinite(contentLength) || contentLength <= 0) {
      return Response.json({ error: "Dimensione della richiesta non valida." }, { status: 411 });
    }
    if (contentLength > 220_000) {
      return Response.json({ error: "Lo scenario demo supera il limite consentito." }, { status: 413 });
    }

    const auth = await authorize(request);
    if ("error" in auth) return auth.error;
    const rawBody = await request.text();
    if (rawBody.length > 220_000) return Response.json({ error: "Lo scenario demo supera il limite consentito." }, { status: 413 });
    const body = JSON.parse(rawBody) as { state?: unknown; revision?: unknown };
    const state = sanitizeDemoState(body.state);
    const stateJson = JSON.stringify(state);
    const revision = Number(body.revision);
    if (!Number.isInteger(revision) || revision < 0) return Response.json({ error: "Versione della sandbox non valida." }, { status: 400 });

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
      return Response.json({ error: "La sandbox è stata aggiornata in un’altra scheda. Ricarica prima di salvare." }, { status: 409 });
    }

    return Response.json({ ok: true, savedAt: new Date().toISOString(), revision: revision + 1 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stato demo non valido.";
    const status = error instanceof SyntaxError || /non valid|incompleto|limite/i.test(message) ? 400 : 500;
    if (status === 500) console.error("Unable to save CRA24 demo workspace", error);
    return Response.json({ error: status === 400 ? message : "Non è stato possibile salvare la sandbox." }, { status });
  }
}
