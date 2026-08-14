const emailPattern = /^[a-z0-9](?:[a-z0-9._+'-]{0,62}[a-z0-9])?@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function cleanSingleLine(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/\p{Cc}/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function cleanMultiline(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(/\p{Cc}/gu, (character) => character === "\n" || character === "\t" ? character : " ")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(value: unknown) {
  return cleanSingleLine(value, 180).toLowerCase();
}

export function isValidProfessionalEmail(value: string) {
  if (!value || value.length > 180 || !emailPattern.test(value)) return false;
  const [local, domain] = value.split("@");
  return Boolean(local && domain && !local.includes("..") && !domain.includes(".."));
}

export function normalizeWebsite(value: unknown) {
  const candidate = cleanSingleLine(value, 240);
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    if (!new Set(["http:", "https:"]).has(url.protocol) || !url.hostname || url.username || url.password) return null;
    url.hash = "";
    return url.toString().slice(0, 240);
  } catch {
    return null;
  }
}

export function hasSameOrigin(requestUrl: string, origin: string | null, fetchSite?: string | null) {
  if (!origin || (fetchSite && fetchSite !== "same-origin")) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}

export function isSameOriginRequest(request: Request) {
  return hasSameOrigin(
    request.url,
    request.headers.get("origin"),
    request.headers.get("sec-fetch-site"),
  );
}

export function parseRequiredContentLength(request: Request, maximumBytes: number) {
  const raw = request.headers.get("content-length");
  if (!raw || !/^\d+$/.test(raw)) return { ok: false as const, status: 411, error: "Dimensione della richiesta non valida." };
  const length = Number(raw);
  if (!Number.isSafeInteger(length) || length <= 0) return { ok: false as const, status: 411, error: "Dimensione della richiesta non valida." };
  if (length > maximumBytes) return { ok: false as const, status: 413, error: "La richiesta supera il limite consentito." };
  return { ok: true as const, length };
}

export function hasContentType(request: Request, expected: string) {
  return (request.headers.get("content-type") ?? "").split(";", 1)[0].trim().toLowerCase() === expected;
}

export function createMailtoLink(recipient: string, subject: string, body: string) {
  const email = normalizeEmail(recipient);
  if (!isValidProfessionalEmail(email)) return null;
  const query = new URLSearchParams({ subject, body });
  return `mailto:${encodeURIComponent(email)}?${query.toString()}`;
}

export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\t\r\n ]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function safeDownloadName(value: string, extension: string) {
  const base = value
    .normalize("NFKC")
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 100) || "CRA24-DEMO";
  return `${base}.${extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "txt"}`;
}
