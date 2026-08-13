import type { Metadata } from "next";
import { ArrowLeft, Inbox, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { BetaRequestRecord, ensureBetaSchema, getBetaDatabase } from "../../db/beta";
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
  const result = await database
    .prepare(`
      SELECT id, full_name, company, email, role, product_type, priority,
             website, case_summary, marketing_consent, status, created_at
      FROM beta_requests
      ORDER BY created_at DESC, id DESC
      LIMIT 100
    `)
    .all<BetaRequestRecord>();
  const requests = result.results ?? [];

  return (
    <main className={styles.adminPage}>
      <header className={styles.adminHeader}>
        <div>
          <Link href="/"><ArrowLeft size={14} /> CRA24</Link>
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
            const reply = `mailto:${item.email}?subject=${encodeURIComponent("CRA24 — risposta alla richiesta beta")}&body=${encodeURIComponent(`Buongiorno ${item.full_name},\n\ngrazie per la richiesta relativa a CRA24 e a ${item.company}.\n\n`)}`;
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
                  <span><b>Aggiornamenti</b>{item.marketing_consent ? "Consenso dato" : "Non richiesti"}</span>
                </div>
                {item.case_summary && <p className={styles.requestSummary}>{item.case_summary}</p>}
                <a className={styles.replyAction} href={reply}><Mail size={14} /> Rispondi via email</a>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
