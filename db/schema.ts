import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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
  ],
);

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
