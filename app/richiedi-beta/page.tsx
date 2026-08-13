import type { Metadata } from "next";
import { Check, Mail, ShieldCheck } from "lucide-react";
import { BetaRequestForm } from "../BetaRequestForm";
import { MarketingShell } from "../MarketingShell";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Richiedi la beta — CRA24" },
  description: "Proponi un caso pilota CRA24. Primo contatto via email, senza chiamate automatiche.",
};

export default function BetaRequestPage() {
  return (
    <MarketingShell lightHeader>
      <main className={styles.subpage}>
        <div className={styles.formLayout}>
          <section className={styles.formHero}>
            <span className={styles.sectionKicker}>PROGRAMMA BETA CRA24</span>
            <h1>Verifichiamo CRA24 su un problema reale, con un perimetro chiaro.</h1>
            <p>
              Stiamo selezionando aziende che producono macchine o prodotti con elementi digitali.
              Descrivi il caso in poche righe: riceverai via email una prima valutazione di
              fattibilità, dei dati necessari e di ciò che possiamo verificare realmente.
            </p>
            <div className={styles.formMicro}>
              <span><Mail size={15} /> Nessun telefono richiesto</span>
              <span><Check size={15} /> Nessuna chiamata programmata automaticamente</span>
              <span><ShieldCheck size={15} /> Non inserire credenziali o dati riservati</span>
            </div>
            <div className={styles.whatNext}>
              <h2>Cosa succede dopo</h2>
              <div>
                <span><b>1</b>La richiesta viene esaminata manualmente.</span>
                <span><b>2</b>Ricevi una risposta via email con fattibilità e perimetro proposto.</span>
                <span><b>3</b>Solo se il caso è compatibile vengono concordati dati e condizioni del test.</span>
              </div>
            </div>
          </section>
          <BetaRequestForm />
        </div>
      </main>
    </MarketingShell>
  );
}
