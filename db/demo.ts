import { env } from "cloudflare:workers";
import { isOwnerEmail, normalizeEmail, ownerEmail } from "./demo-logic";
import { ensureSecuritySchema } from "./security";

export { isOwnerEmail, normalizeEmail, ownerEmail } from "./demo-logic";

type AppEnv = { DB?: D1Database };

export type DemoAccessRecord = {
  email: string;
  user_id?: string | null;
  company: string;
  role: string;
  status: string;
  expires_at?: string | null;
};

export type DemoWorkspaceRecord = {
  user_id: string;
  email: string;
  company: string;
  state_json: string;
  updated_at: string;
};

export type AdminAuditContext = {
  actorUserId: string;
  actorEmail: string;
  requestId: string;
};

const initializedDatabases = new WeakSet<object>();

export function getDemoDatabase() {
  const database = (env as unknown as AppEnv).DB;
  if (!database) throw new Error("Il database della demo CRA24 non è disponibile.");
  return database;
}

export async function ensureDemoSchema(database: D1Database) {
  const key = database as unknown as object;
  if (initializedDatabases.has(key)) return;
  await initializeDemoSchema(database);
  initializedDatabases.add(key);
}

async function initializeDemoSchema(database: D1Database) {
  await database.prepare(`
    CREATE TABLE IF NOT EXISTS demo_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      user_id TEXT,
      company TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Tester beta',
      beta_request_id INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const columns = await database.prepare("PRAGMA table_info(demo_access)").all<{ name: string }>();
  if (!(columns.results ?? []).some((column) => column.name === "user_id")) {
    await database.prepare("ALTER TABLE demo_access ADD COLUMN user_id TEXT").run();
  }
  if (!(columns.results ?? []).some((column) => column.name === "expires_at")) {
    await database.prepare("ALTER TABLE demo_access ADD COLUMN expires_at TEXT").run();
  }

  await database.batch([
    database.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_access_email
      ON demo_access(email)
    `),
    database.prepare(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_access_user_id
      ON demo_access(user_id)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_demo_access_status
      ON demo_access(status)
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS demo_workspaces (
        user_id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        company TEXT NOT NULL DEFAULT '',
        state_json TEXT NOT NULL DEFAULT '',
        revision INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_demo_workspaces_email
      ON demo_workspaces(email)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_demo_workspaces_updated
      ON demo_workspaces(updated_at)
    `),
  ]);

  const workspaceColumns = await database.prepare("PRAGMA table_info(demo_workspaces)").all<{ name: string }>();
  if (!(workspaceColumns.results ?? []).some((column) => column.name === "revision")) {
    await database.prepare("ALTER TABLE demo_workspaces ADD COLUMN revision INTEGER NOT NULL DEFAULT 0").run();
  }

  await ensureSecuritySchema(database);
  await database.batch([
    database.prepare(`
      UPDATE demo_access
      SET expires_at = datetime(updated_at, '+90 days')
      WHERE status = 'active' AND expires_at IS NULL
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_demo_access_expires
      ON demo_access(expires_at)
    `),
  ]);
}

export async function getDemoAccess(database: D1Database, email: string, userId: string) {
  if (isOwnerEmail(email)) {
    return { email: ownerEmail, user_id: userId, company: "Kreluna", role: "Proprietario", status: "active" } satisfies DemoAccessRecord;
  }

  const bound = await database
    .prepare(`
      SELECT email, user_id, company, role, status, expires_at
      FROM demo_access
      WHERE user_id = ?1 AND email = ?2 AND status = 'active'
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `)
    .bind(userId, normalizeEmail(email))
    .first<DemoAccessRecord>();
  if (bound) return bound;

  const invited = await database
    .prepare(`
      SELECT email, user_id, company, role, status, expires_at
      FROM demo_access
      WHERE email = ?1 AND status = 'active' AND user_id IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `)
    .bind(normalizeEmail(email))
    .first<DemoAccessRecord>();
  if (!invited) return null;

  await database.batch([
    database
      .prepare(`
        UPDATE demo_access
        SET user_id = NULL, status = 'revoked', updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?1 AND email != ?2
      `)
      .bind(userId, normalizeEmail(email)),
    database
      .prepare(`
      UPDATE demo_access
      SET user_id = ?1, updated_at = CURRENT_TIMESTAMP
      WHERE email = ?2 AND status = 'active' AND user_id IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      `)
      .bind(userId, normalizeEmail(email)),
  ]);

  return database
    .prepare(`
      SELECT email, user_id, company, role, status, expires_at
      FROM demo_access
      WHERE user_id = ?1 AND email = ?2 AND status = 'active'
        AND expires_at > CURRENT_TIMESTAMP
      LIMIT 1
    `)
    .bind(userId, normalizeEmail(email))
    .first<DemoAccessRecord>();
}

export async function setBetaAccess(
  database: D1Database,
  requestedEmail: string,
  enabled: boolean,
  audit: AdminAuditContext,
) {
  const normalizedEmail = normalizeEmail(requestedEmail);
  const request = await database
    .prepare(`
      SELECT id, email, company, role
      FROM beta_requests
      WHERE email = ?1
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `)
    .bind(normalizedEmail)
    .first<{ id: number; email: string; company: string; role: string }>();

  if (!request) throw new Error("Richiesta beta non trovata.");

  const email = normalizeEmail(request.email);
  const status = enabled ? "Approvata" : "Revocata";
  const accessStatus = enabled ? "active" : "revoked";

  await database.batch([
    database
      .prepare("UPDATE beta_requests SET status = ?1 WHERE email = ?2")
      .bind(status, email),
    ...(enabled
      ? [database
          .prepare(`
            UPDATE demo_access
            SET user_id = NULL
            WHERE email = ?1 AND (
              status != 'active' OR expires_at IS NULL OR expires_at <= CURRENT_TIMESTAMP
            )
          `)
          .bind(email)]
      : []),
    database
      .prepare(`
        INSERT INTO demo_access (email, company, role, beta_request_id, status, expires_at, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, CASE WHEN ?5 = 'active' THEN datetime('now', '+90 days') ELSE NULL END, CURRENT_TIMESTAMP)
        ON CONFLICT(email) DO UPDATE SET
          company = excluded.company,
          role = excluded.role,
          beta_request_id = excluded.beta_request_id,
          status = excluded.status,
          expires_at = excluded.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `)
      .bind(email, request.company, request.role, request.id, accessStatus),
    ...(enabled
      ? []
      : [
          database
            .prepare("UPDATE demo_access SET user_id = NULL WHERE email = ?1")
            .bind(email),
        ]),
    database
      .prepare(`
        INSERT INTO admin_audit_log (
          actor_user_id, actor_email, action, target_email, target_company, request_id
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
      `)
      .bind(
        audit.actorUserId,
        normalizeEmail(audit.actorEmail),
        enabled ? "approve_beta_access" : "revoke_beta_access",
        email,
        request.company,
        audit.requestId,
      ),
  ]);

  return { email, company: request.company, status };
}
