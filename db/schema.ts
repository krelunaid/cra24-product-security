import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const betaRequests = sqliteTable(
  "beta_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fullName: text("full_name").notNull(),
    company: text("company").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull(),
    productType: text("product_type").notNull(),
    priority: text("priority").notNull(),
    website: text("website").notNull().default(""),
    caseSummary: text("case_summary").notNull().default(""),
    marketingConsent: integer("marketing_consent", { mode: "boolean" }).notNull().default(false),
    locale: text("locale").notNull().default("it"),
    utmSource: text("utm_source").notNull().default(""),
    utmMedium: text("utm_medium").notNull().default(""),
    utmCampaign: text("utm_campaign").notNull().default(""),
    status: text("status").notNull().default("Nuova"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_beta_requests_email_created").on(table.email, table.createdAt),
    index("idx_beta_requests_status_created").on(table.status, table.createdAt),
    index("idx_beta_requests_created").on(table.createdAt),
  ],
);

export const demoAccess = sqliteTable(
  "demo_access",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    userId: text("user_id"),
    company: text("company").notNull(),
    role: text("role").notNull().default("Tester beta"),
    betaRequestId: integer("beta_request_id"),
    status: text("status").notNull().default("active"),
    expiresAt: text("expires_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_demo_access_email").on(table.email),
    uniqueIndex("idx_demo_access_user_id").on(table.userId),
    index("idx_demo_access_status").on(table.status),
    index("idx_demo_access_expires").on(table.expiresAt),
  ],
);

export const requestRateLimits = sqliteTable(
  "request_rate_limits",
  {
    scope: text("scope").notNull(),
    actorHash: text("actor_hash").notNull(),
    windowStart: integer("window_start").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.scope, table.actorHash, table.windowStart] }),
    index("idx_request_rate_limits_updated").on(table.updatedAt),
  ],
);

export const adminAuditLog = sqliteTable(
  "admin_audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorUserId: text("actor_user_id").notNull(),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetEmail: text("target_email").notNull(),
    targetCompany: text("target_company").notNull().default(""),
    requestId: text("request_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("idx_admin_audit_log_created").on(table.createdAt)],
);

export const projectMaintenance = sqliteTable("project_maintenance", {
  name: text("name").primaryKey(),
  leaseUntil: integer("lease_until").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const demoWorkspaces = sqliteTable(
  "demo_workspaces",
  {
    userId: text("user_id").primaryKey(),
    email: text("email").notNull(),
    company: text("company").notNull().default(""),
    stateJson: text("state_json").notNull().default(""),
    revision: integer("revision").notNull().default(0),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_demo_workspaces_email").on(table.email),
    index("idx_demo_workspaces_updated").on(table.updatedAt),
  ],
);
