import type { Metadata } from "next";
import { MarketingShell } from "../MarketingShell";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Informativa privacy — CRA24" },
  description: "Informativa sul trattamento dei dati inviati tramite il modulo beta CRA24.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell lightHeader>
      <main className={styles.subpage}>
        <article className={styles.privacyArticle}>
          <header>
            <span className={styles.sectionKicker}>PRIVACY · RICHIESTE BETA</span>
            <h1>Informativa sul trattamento dei dati.</h1>
            <p>Versione del 14 agosto 2026</p>
          </header>
          <div className={styles.privacyContent}>
            <section>
              <h2>Titolare e contatti</h2>
              <p>Il titolare del trattamento per il progetto CRA24 è Kreluna. Per richieste relative ai dati personali puoi scrivere a <a href="mailto:cra24@kreluna.it">cra24@kreluna.it</a>.</p>
            </section>
            <section>
              <h2>Dati trattati</h2>
              <p>Trattiamo i dati inseriti nel modulo: nome, azienda, email professionale, ruolo, tipologia di prodotto, area di interesse, eventuale sito e descrizione del caso. Il sito tratta inoltre i dati tecnici strettamente necessari a sicurezza e funzionamento.</p>
            </section>
            <section>
              <h2>Finalità e base giuridica</h2>
              <ul>
                <li>Gestire la richiesta beta e gli eventuali passaggi precontrattuali: art. 6, par. 1, lett. b) GDPR.</li>
                <li>Proteggere il sito da abusi e problemi di sicurezza: legittimo interesse, art. 6, par. 1, lett. f) GDPR.</li>
                <li>Inviare aggiornamenti su CRA24: soltanto con consenso facoltativo, art. 6, par. 1, lett. a) GDPR.</li>
              </ul>
            </section>
            <section>
              <h2>Conferimento e decisioni</h2>
              <p>I campi obbligatori servono per gestire la richiesta. Il consenso agli aggiornamenti è facoltativo e il suo rifiuto non limita la candidatura. Non sono adottate decisioni esclusivamente automatizzate sull’ammissione alla beta.</p>
            </section>
            <section>
              <h2>Conservazione</h2>
              <p>I dati relativi alla richiesta vengono conservati per il tempo necessario alla valutazione e comunque non oltre 12 mesi dall’ultimo contatto, salvo obblighi di legge. I dati usati per aggiornamenti vengono conservati fino alla revoca del consenso e sottoposti a verifica periodica.</p>
            </section>
            <section>
              <h2>Destinatari e trasferimenti</h2>
              <p>I dati possono essere trattati da persone autorizzate e da fornitori di hosting, posta elettronica e servizi tecnici necessari. Qualora un fornitore comporti trasferimenti fuori dallo Spazio economico europeo, questi avverranno nel rispetto del Capo V del GDPR.</p>
            </section>
            <section>
              <h2>I tuoi diritti</h2>
              <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità ove applicabile e opposizione. Puoi revocare in qualsiasi momento il consenso agli aggiornamenti scrivendo a <a href="mailto:cra24@kreluna.it">cra24@kreluna.it</a>, senza pregiudicare i trattamenti precedenti. Puoi inoltre presentare reclamo al Garante per la protezione dei dati personali.</p>
            </section>
          </div>
          <p className={styles.privacyCaution}>CRA24 è in fase beta. Questa informativa descrive il trattamento effettuato tramite il modulo pubblico; prima di campagne o raccolte su larga scala, governance e testi privacy devono essere riesaminati in base all’assetto effettivo di Kreluna e dei fornitori utilizzati.</p>
        </article>
      </main>
    </MarketingShell>
  );
}
