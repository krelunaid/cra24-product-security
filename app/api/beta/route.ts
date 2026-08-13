import { ensureBetaSchema, getBetaDatabase } from "../../../db/beta";

const priorities = new Set([
  "Documentazione tecnica",
  "Vulnerabilità",
  "SBOM e componenti",
  "Gestione fornitori",
  "Scadenze e notifiche",
  "Altro",
]);

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const fullName = clean(payload.fullName, 120);
    const company = clean(payload.company, 160);
    const email = clean(payload.email, 180).toLowerCase();
    const role = clean(payload.role, 140);
    const productType = clean(payload.productType, 180);
    const priority = clean(payload.priority, 80);
    const website = clean(payload.website, 240);
    const caseSummary = clean(payload.caseSummary, 1800);
    const locale = clean(payload.locale, 12) || "it";
    const utmSource = clean(payload.utmSource, 120);
    const utmMedium = clean(payload.utmMedium, 120);
    const utmCampaign = clean(payload.utmCampaign, 160);
    const startedAt = Number(payload.startedAt);

    if (clean(payload.companyFax, 100)) {
      return Response.json({ ok: true }, { status: 202 });
    }

    if (!fullName || !company || !isValidEmail(email) || !role || !productType || !priorities.has(priority)) {
      return Response.json({ error: "Controlla i campi obbligatori e riprova." }, { status: 400 });
    }

    if (payload.privacyAccepted !== true) {
      return Response.json({ error: "È necessario prendere visione dell’informativa privacy." }, { status: 400 });
    }

    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 800 || Date.now() - startedAt > 86_400_000) {
      return Response.json({ error: "La sessione del modulo è scaduta. Ricarica la pagina e riprova." }, { status: 400 });
    }

    const database = getBetaDatabase();
    await ensureBetaSchema(database);

    const duplicate = await database
      .prepare(`
        SELECT id FROM beta_requests
        WHERE email = ?1 AND created_at >= datetime('now', '-15 minutes')
        LIMIT 1
      `)
      .bind(email)
      .first<{ id: number }>();

    if (!duplicate) {
      await database
        .prepare(`
          INSERT INTO beta_requests (
            full_name, company, email, role, product_type, priority,
            website, case_summary, marketing_consent, locale,
            utm_source, utm_medium, utm_campaign
          ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
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
    }

    return Response.json({ ok: true }, { status: duplicate ? 200 : 201 });
  } catch (error) {
    console.error("Unable to save CRA24 beta request", error);
    return Response.json(
      { error: "Non è stato possibile registrare la richiesta. Puoi scrivere a cra24@kreluna.it." },
      { status: 500 },
    );
  }
}
