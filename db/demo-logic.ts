export const ownerEmail = "andreagadducci@icloud.com";

export const severities = new Set(["Critica", "Alta", "Media"]);
export const incidentStatuses = new Set(["Triage", "In corso", "Monitoraggio", "Chiuso"]);
export const assetStatuses = new Set(["Da verificare", "Patch pianificata", "Mitigato", "Non esposto"]);

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isOwnerEmail(value: string) {
  return normalizeEmail(value) === ownerEmail;
}

export function cleanString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function cleanNumber(value: unknown, min: number, max: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, Math.round(number))) : min;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function sanitizeDemoState(value: unknown) {
  if (!isObject(value) || value.version !== 1) throw new Error("Stato demo non valido.");

  const rawIncidents = Array.isArray(value.incidents) ? value.incidents.slice(0, 25) : [];
  const rawAssets = Array.isArray(value.assets) ? value.assets.slice(0, 250) : [];
  if (!rawIncidents.length || !rawAssets.length) throw new Error("Lo scenario demo è incompleto.");

  const incidents = rawIncidents.map((item, index) => {
    if (!isObject(item)) throw new Error("Incidente demo non valido.");
    const severity = cleanString(item.severity, 20);
    const status = cleanString(item.status, 30);
    if (!severities.has(severity) || !incidentStatuses.has(status)) throw new Error("Stato incidente non valido.");
    return {
      id: cleanNumber(item.id, 1, Number.MAX_SAFE_INTEGER) || index + 1,
      cve: cleanString(item.cve, 40),
      title: cleanString(item.title, 180),
      component: cleanString(item.component, 140),
      version: cleanString(item.version, 80),
      severity,
      status,
      detected: cleanString(item.detected, 80),
      serials: cleanNumber(item.serials, 0, 1_000_000),
      customers: cleanNumber(item.customers, 0, 100_000),
      owner: cleanString(item.owner, 120),
      progress: cleanNumber(item.progress, 0, 100),
      summary: cleanString(item.summary, 1200),
    };
  });

  const assets = rawAssets.map((item, index) => {
    if (!isObject(item)) throw new Error("Seriale demo non valido.");
    const status = cleanString(item.status, 30);
    if (!assetStatuses.has(status)) throw new Error("Stato seriale non valido.");
    return {
      id: cleanString(item.id, 80) || `DEMO-${index + 1}`,
      model: cleanString(item.model, 120),
      customer: cleanString(item.customer, 160),
      site: cleanString(item.site, 160),
      release: cleanString(item.release, 80),
      exposure: cleanString(item.exposure, 80),
      status,
    };
  });

  const rawSettings = isObject(value.settings) ? value.settings : {};
  const state = {
    version: 1,
    incidents,
    assets,
    settings: {
      humanApproval: rawSettings.humanApproval !== false,
      escalation: rawSettings.escalation !== false,
    },
    tourSeen: value.tourSeen === true,
    tourCompleted: value.tourCompleted === true,
  };

  if (JSON.stringify(state).length > 180_000) throw new Error("Lo scenario demo supera il limite consentito.");
  return state;
}

export function hasSameOrigin(requestUrl: string, origin: string | null) {
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(requestUrl).host;
  } catch {
    return false;
  }
}
