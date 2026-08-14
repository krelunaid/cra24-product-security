/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a Vinext production prefetch failure. */
import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { MarketingShell } from "../MarketingShell";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Richiesta ricevuta — CRA24" },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <MarketingShell lightHeader>
      <main className={styles.subpage}>
        <div className={styles.thankYouWrap}>
          <section className={styles.thankYouCard}>
            <span className={styles.successIcon}><CheckCircle2 size={27} /></span>
            <span className={styles.sectionKicker}>RICHIESTA BETA</span>
            <h1>Richiesta ricevuta.</h1>
            <p>
              Le informazioni sono state registrate. Il primo contatto avverrà via email
              all’indirizzo indicato, con una valutazione del caso e gli eventuali passaggi successivi.
            </p>
            <span className={styles.thankYouNote}><Mail size={14} /> Nessuna telefonata verrà programmata automaticamente.</span>
            <div className={styles.thankYouActions}>
              <a className={styles.darkAction} href="/accesso">Accedi alla demo <ArrowRight size={15} /></a>
              <a className={styles.outlineAction} href="/">Torna alla homepage</a>
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}
