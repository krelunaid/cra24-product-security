import { ensureBetaSchema } from "../../../../db/beta";
import { ensureDemoSchema, getDemoDatabase, isOwnerEmail, setBetaAccess } from "../../../../db/demo";
import { getChatGPTUserFromHeaders } from "../../../chatgpt-auth";

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  try {
    if (!isSameOrigin(request)) return Response.json({ error: "Origine non valida." }, { status: 403 });
    const user = getChatGPTUserFromHeaders(request.headers);
    if (!user || !isOwnerEmail(user.email)) return Response.json({ error: "Non autorizzato." }, { status: 403 });

    const form = await request.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const action = String(form.get("action") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180 || !["approve", "revoke"].includes(action)) {
      return Response.json({ error: "Richiesta non valida." }, { status: 400 });
    }

    const database = getDemoDatabase();
    await ensureBetaSchema(database);
    await ensureDemoSchema(database);
    await setBetaAccess(database, email, action === "approve");
    return Response.redirect(new URL(`/richieste?updated=${action}`, requestUrl.origin), 303);
  } catch (error) {
    console.error("Unable to update CRA24 beta access", error);
    return Response.redirect(new URL("/richieste?updated=error", requestUrl.origin), 303);
  }
}
