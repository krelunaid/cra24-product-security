const initializedDatabases = new WeakSet<object>();

export async function ensureSecuritySchema(database: D1Database) {
  const key = database as unknown as object;
  if (initializedDatabases.has(key)) return;
  await database.batch([
    database.prepare(`
      CREATE TABLE IF NOT EXISTS request_rate_limits (
        scope TEXT NOT NULL,
        actor_hash TEXT NOT NULL,
        window_start INTEGER NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (scope, actor_hash, window_start)
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_request_rate_limits_updated
      ON request_rate_limits(updated_at)
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_user_id TEXT NOT NULL,
        actor_email TEXT NOT NULL,
        action TEXT NOT NULL,
        target_email TEXT NOT NULL,
        target_company TEXT NOT NULL DEFAULT '',
        request_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created
      ON admin_audit_log(created_at)
    `),
    database.prepare(`
      CREATE TABLE IF NOT EXISTS project_maintenance (
        name TEXT PRIMARY KEY,
        lease_until INTEGER NOT NULL,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
  ]);
  initializedDatabases.add(key);
}

async function digest(value: string) {
  const bytes = new TextEncoder().encode(`cra24-rate-limit-v1|${value}`);
  const result = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function requestActorHash(request: Request, scope: string) {
  const address = request.headers.get("cf-connecting-ip")?.trim() || "unknown";
  return digest(`${scope}|${address}`);
}

export async function identifierHash(value: string, scope: string) {
  return digest(`${scope}|${value}`);
}

export async function consumeRateLimit(
  database: D1Database,
  scope: string,
  actorHash: string,
  maximum: number,
  windowSeconds: number,
) {
  await ensureSecuritySchema(database);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / windowSeconds) * windowSeconds;
  await database.prepare(`
    INSERT INTO request_rate_limits (scope, actor_hash, window_start, count, updated_at)
    VALUES (?1, ?2, ?3, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(scope, actor_hash, window_start) DO UPDATE SET
      count = request_rate_limits.count + 1,
      updated_at = CURRENT_TIMESTAMP
  `).bind(scope, actorHash, windowStart).run();
  const row = await database.prepare(`
    SELECT count FROM request_rate_limits
    WHERE scope = ?1 AND actor_hash = ?2 AND window_start = ?3
  `).bind(scope, actorHash, windowStart).first<{ count: number }>();
  const count = Number(row?.count ?? maximum + 1);
  return {
    allowed: count <= maximum,
    remaining: Math.max(0, maximum - count),
    retryAfter: Math.max(1, windowStart + windowSeconds - now),
  };
}

export async function purgeExpiredProjectData(database: D1Database) {
  await ensureSecuritySchema(database);
  const tables = await database.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name IN (
      'request_rate_limits', 'admin_audit_log', 'beta_requests', 'demo_workspaces', 'demo_access'
    )
  `).all<{ name: string }>();
  const available = new Set((tables.results ?? []).map((row) => row.name));
  const statements: D1PreparedStatement[] = [];
  if (available.has("request_rate_limits")) statements.push(database.prepare("DELETE FROM request_rate_limits WHERE updated_at < datetime('now', '-2 days')"));
  if (available.has("admin_audit_log")) statements.push(database.prepare("DELETE FROM admin_audit_log WHERE created_at < datetime('now', '-12 months')"));
  if (available.has("beta_requests")) statements.push(database.prepare("DELETE FROM beta_requests WHERE created_at < datetime('now', '-12 months')"));
  if (available.has("demo_workspaces")) statements.push(database.prepare("DELETE FROM demo_workspaces WHERE updated_at < datetime('now', '-12 months')"));
  if (available.has("demo_access")) {
    statements.push(database.prepare(`
      DELETE FROM demo_access
      WHERE (status != 'active' AND updated_at < datetime('now', '-12 months'))
         OR (expires_at IS NOT NULL AND expires_at < datetime('now', '-12 months'))
    `));
  }
  if (statements.length) await database.batch(statements);
}

export async function acquireMaintenanceLease(database: D1Database, leaseSeconds = 6 * 60 * 60) {
  await ensureSecuritySchema(database);
  const now = Math.floor(Date.now() / 1000);
  const result = await database.prepare(`
    INSERT INTO project_maintenance (name, lease_until, updated_at)
    VALUES ('retention', ?1, CURRENT_TIMESTAMP)
    ON CONFLICT(name) DO UPDATE SET
      lease_until = excluded.lease_until,
      updated_at = CURRENT_TIMESTAMP
    WHERE project_maintenance.lease_until <= ?2
  `).bind(now + leaseSeconds, now).run();
  return Number(result.meta.changes ?? 0) > 0;
}
