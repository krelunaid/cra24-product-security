import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
