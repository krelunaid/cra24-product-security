import type { Metadata } from "next";
import { ArrowRight, Check, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ensureDemoSchema, getDemoAccess, getDemoDatabase, isOwnerEmail } from "../../db/demo";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";
import { MarketingShell } from "../MarketingShell";
import styles from "../marketing.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Accesso tester — CRA24" },
  description: "Accedi alla sandbox privata CRA24 con l'indirizzo approvato per la beta.",
  robots: { index: false, follow: false },
};

export default async function AccessPage() {
  const user = await getChatGPTUser();
  let access: Awaited<ReturnType<typeof getDemoAccess>> = null;
  if (user) {
    const database = getDemoDatabase();
    await ensureDemoSchema(database);
    access = await getDemoAccess(database, user.email, user.userId);
  }

  return (
    <MarketingShell lightHeader>
      <main className={styles.accessPage}>
        <section className={styles.accessCard}>
          <span className={styles.accessIcon}>{access ? <ShieldCheck size={25} /> : <LockKeyhole size={25} />}</span>
          <span className={styles.sectionKicker}>ACCESSO TESTER CRA24</span>
          {access && user ? (
            <>
              <h1>La tua sandbox è pronta.</h1>
              <p>Accesso autorizzato per <strong>{user.email}</strong>. Il tuo scenario dimostrativo viene salvato separatamente e può essere ripreso in seguito.</p>
              <div className={styles.accessIdentity}>
                <span><b>Azienda</b>{access.company}</span>
                <span><b>Ruolo</b>{access.role}</span>
              </div>
              <Link className={styles.accessPrimary} href="/demo">Apri la sandbox <ArrowRight size={16} /></Link>
              {isOwnerEmail(user.email) && <Link className={styles.accessSecondary} href="/richieste">Gestisci richieste e accessi</Link>}
              <a className={styles.accessSecondary} href={chatGPTSignOutPath("/accesso")}>Usa un altro account</a>
            </>
          ) : user ? (
            <>
              <h1>Questo indirizzo non è ancora abilitato.</h1>
              <p>Hai effettuato l’accesso come <strong>{user.email}</strong>, ma l’indirizzo non compare tra i tester approvati.</p>
              <div className={styles.accessSteps}>
                <span><Check size={15} /> Invia la candidatura alla beta</span>
                <span><Check size={15} /> Attendi la conferma via email</span>
                <span><Check size={15} /> Rientra usando lo stesso indirizzo approvato</span>
              </div>
              <Link className={styles.accessPrimary} href="/richiedi-beta">Richiedi l’accesso <ArrowRight size={16} /></Link>
              <a className={styles.accessSecondary} href={chatGPTSignOutPath("/accesso")}>Accedi con un altro indirizzo</a>
            </>
          ) : (
            <>
              <h1>Entra nella beta privata.</h1>
              <p>Usa lo stesso indirizzo email professionale approvato da Kreluna. L’accesso è gestito in modo sicuro tramite il tuo account ChatGPT: CRA24 non riceve né conserva la password.</p>
              <div className={styles.accessSteps}>
                <span><KeyRound size={15} /> Nessuna nuova password CRA24</span>
                <span><ShieldCheck size={15} /> Identità verificata all’accesso</span>
                <span><LockKeyhole size={15} /> Sandbox separata per ogni tester</span>
              </div>
              <a className={styles.accessPrimary} href={chatGPTSignInPath("/demo")}>Accedi alla sandbox <ArrowRight size={16} /></a>
              <p className={styles.accessFinePrint}>Non sei ancora stato approvato? <Link href="/richiedi-beta">Richiedi la beta</Link>.</p>
            </>
          )}
        </section>
        <aside className={styles.accessAside}>
          <span>COME FUNZIONA</span>
          <h2>Un accesso semplice, senza scambiarsi password.</h2>
          <ol>
            <li><b>1</b><span><strong>Il tester richiede la beta</strong><small>Lascia azienda, ruolo ed email professionale.</small></span></li>
            <li><b>2</b><span><strong>Kreluna approva l’indirizzo</strong><small>L’abilitazione avviene manualmente dall’area richieste.</small></span></li>
            <li><b>3</b><span><strong>Il tester entra nella sandbox</strong><small>Accede con lo stesso indirizzo e ritrova il proprio scenario.</small></span></li>
          </ol>
          <p>La beta usa soltanto dati sintetici. File e collegamenti aziendali reali vengono concordati separatamente durante un pilot.</p>
        </aside>
      </main>
    </MarketingShell>
  );
}
