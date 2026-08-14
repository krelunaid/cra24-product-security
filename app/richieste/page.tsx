/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a Vinext production prefetch failure. */
import type { Metadata } from "next";
import { ArrowLeft, Inbox, LockKeyhole, Mail } from "lucide-react";
import { BetaRequestRecord, ensureBetaSchema, getBetaDatabase } from "../../db/beta";
import { ensureDemoSchema } from "../../db/demo";
import { createMailtoLink } from "../../lib/security";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import styles from "../marketing.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Richieste beta — CRA24" },
  robots: { index: false, follow: false },
};

const ownerEmail = "andreagadducci@icloud.com";

export default async function RequestsPage() {
  const user = await requireChatGPTUser("/richieste");

  if (user.email.toLowerCase() !== ownerEmail) {
    return (
      <main className={styles.adminDenied}>
        <LockKeyhole size={25} />
        <h1>Area riservata.</h1>
        <p>Questo account non è autorizzato a consultare le richieste CRA24.</p>
        <a href={chatGPTSignOutPath("/")}>Esci e torna al sito</a>
      </main>
    );
  }

  const database = getBetaDatabase();
  await ensureBetaSchema(database);
  await ensureDemoSchema(database);
  const result = await database
    .prepare(`
      SELECT br.id, br.full_name, br.company, br.email, br.role, br.product_type, br.priority,
             br.website, br.case_summary, br.marketing_consent,
             CASE
               WHEN da.status = 'active' AND da.expires_at > CURRENT_TIMESTAMP THEN 'active'
               WHEN da.status IS NOT NULL THEN da.status
               ELSE br.status
             END AS status,
             br.created_at
      FROM beta_requests br
      LEFT JOIN demo_access da ON da.email = br.email
      ORDER BY br.created_at DESC, br.id DESC
      LIMIT 100
    `)
    .all<BetaRequestRecord>();
  const requests: BetaRequestRecord[] = result.results ?? [];

  return (
    <main className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div>
          <a href="/"><ArrowLeft size={14} /> CRA24</a>
          <h1>Richieste beta</h1>
          <p>Le ultime 100 candidature ricevute dal sito.</p>
        </div>
        <span>{user.displayName}</span>
      </header>
      {requests.length === 0 ? (
        <section className={styles.adminEmpty}>
          <Inbox size={25} />
          <h2>Nessuna richiesta ricevuta.</h2>
          <p>Le nuove candidature appariranno qui.</p>
        </section>
      ) : (
        <section className={styles.requestList}>
          {requests.map((item) => {
            const accessActive = item.status === "active";
            const reply = createMailtoLink(
              item.email,
              "CRA24 — risposta alla richiesta beta",
              `Buongiorno ${item.full_name},\n\ngrazie per la richiesta relativa a CRA24 e a ${item.company}.\n\n`,
            );
            const invitation = createMailtoLink(
              item.email,
              "Accesso alla beta privata CRA24",
              `Buongiorno ${item.full_name},\n\nla richiesta di ${item.company} è stata approvata.\n\nPuoi accedere alla sandbox CRA24 da questo indirizzo:\nhttps://cra24.kreluna.it/accesso\n\nUsa lo stesso indirizzo email professionale con cui hai richiesto la beta (${item.email}). Se non hai ancora un account ChatGPT, durante l’accesso potrai crearne uno. CRA24 non riceve né conserva la tua password.\n\nLa sandbox contiene esclusivamente dati sintetici: non inserire dati riservati o relativi a macchine reali.\n\nCordiali saluti,\nCRA24 by Kreluna`,
            );
            return (
              <article key={item.id}>
                <div className={styles.requestTop}>
                  <div>
                    <span>{item.company}</span>
                    <h2>{item.full_name}</h2>
                    <p>{item.role} · {item.email}</p>
                  </div>
                  <time>{new Date(`${item.created_at}Z`).toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" })}</time>
                </div>
                <div className={styles.requestMeta}>
                  <span><b>Prodotto</b>{item.product_type}</span>
                  <span><b>Priorità</b>{item.priority}</span>
                  <span><b>Accesso</b>{accessActive ? "Attivo · 90 giorni" : item.status}</span>
                  <span><b>Aggiornamenti</b>{item.marketing_consent ? "Consenso dato" : "Non richiesti"}</span>
                </div>
                {item.case_summary && <p className={styles.requestSummary}>{item.case_summary}</p>}
                <div className={styles.requestActions}>
                  <form action="/api/admin/requests" method="post">
                    <input type="hidden" name="email" value={item.email} />
                    <input type="hidden" name="action" value={accessActive ? "revoke" : "approve"} />
                    <button className={accessActive ? styles.revokeAction : styles.approveAction} type="submit">
                      {accessActive ? "Revoca accesso" : "Approva sandbox"}
                    </button>
                  </form>
                  {reply && <a className={styles.replyAction} href={reply}><Mail size={14} /> Rispondi via email</a>}
                  {accessActive && invitation && (
                    <a className={styles.inviteAction} href={invitation}>
                      Invia istruzioni di accesso
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
