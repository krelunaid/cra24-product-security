import { env } from "cloudflare:workers";

type AppEnv = { DB?: D1Database };

export type BetaRequestRecord = {
  id: number;
  full_name: string;
  company: string;
  email: string;
  role: string;
  product_type: string;
  priority: string;
  website: string;
  case_summary: string;
  marketing_consent: number;
  status: string;
  created_at: string;
};

const initializedDatabases = new WeakSet<object>();

export function getBetaDatabase() {
  const database = (env as unknown as AppEnv).DB;
  if (!database) throw new Error("Il database delle richieste beta non è disponibile.");
  return database;
}

export async function ensureBetaSchema(database: D1Database) {
  const key = database as unknown as object;
  if (initializedDatabases.has(key)) return;
  await initializeBetaSchema(database);
  initializedDatabases.add(key);
}

async function initializeBetaSchema(database: D1Database) {
  await database.batch([
    database.prepare(`
      CREATE TABLE IF NOT EXISTS beta_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL,
        product_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        website TEXT NOT NULL DEFAULT '',
        case_summary TEXT NOT NULL DEFAULT '',
        marketing_consent INTEGER NOT NULL DEFAULT 0,
        locale TEXT NOT NULL DEFAULT 'it',
        utm_source TEXT NOT NULL DEFAULT '',
        utm_medium TEXT NOT NULL DEFAULT '',
        utm_campaign TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'Nuova',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_beta_requests_email_created
      ON beta_requests(email, created_at)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_beta_requests_status_created
      ON beta_requests(status, created_at)
    `),
    database.prepare(`
      CREATE INDEX IF NOT EXISTS idx_beta_requests_created
      ON beta_requests(created_at)
    `),
  ]);
  await database.prepare("UPDATE beta_requests SET email = lower(trim(email)) WHERE email != lower(trim(email))").run();
}
