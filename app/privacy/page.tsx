import type { Metadata } from "next";
import { MarketingShell } from "../MarketingShell";
import styles from "../marketing.module.css";

export const metadata: Metadata = {
  title: { absolute: "Informativa privacy — CRA24" },
  description: "Informativa sul trattamento dei dati per richieste e accesso alla beta CRA24.",
};

export default function PrivacyPage() {
  return (
    <MarketingShell lightHeader>
      <main className={styles.subpage}>
        <article className={styles.privacyArticle}>
          <header>
            <span className={styles.sectionKicker}>PRIVACY · BETA CRA24</span>
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
              <p>Trattiamo i dati inseriti nel modulo: nome, azienda, email professionale, ruolo, tipologia di prodotto, area di interesse, eventuale sito e descrizione del caso. Per i tester approvati trattiamo inoltre l’identificativo stabile e l’email restituiti dal servizio di accesso, l’azienda associata, lo stato dell’abilitazione, l’avanzamento della sandbox e i dati tecnici strettamente necessari a sicurezza e funzionamento.</p>
            </section>
            <section>
              <h2>Finalità e base giuridica</h2>
              <ul>
                <li>Gestire la richiesta beta e gli eventuali passaggi precontrattuali: art. 6, par. 1, lett. b) GDPR.</li>
                <li>Verificare l’identità del tester, controllare l’abilitazione e salvare la sandbox richiesta: esecuzione della richiesta beta e misure precontrattuali, art. 6, par. 1, lett. b) GDPR.</li>
                <li>Proteggere il sito da abusi e problemi di sicurezza: legittimo interesse, art. 6, par. 1, lett. f) GDPR.</li>
                <li>Inviare aggiornamenti su CRA24: soltanto con consenso facoltativo, art. 6, par. 1, lett. a) GDPR.</li>
              </ul>
            </section>
            <section>
              <h2>Conferimento e decisioni</h2>
              <p>I campi obbligatori servono per gestire la richiesta. Il consenso agli aggiornamenti è facoltativo e il suo rifiuto non limita la candidatura. L’ammissione alla beta viene decisa manualmente. Per accedere alla sandbox è necessario autenticarsi tramite un account ChatGPT associato allo stesso indirizzo approvato; CRA24 non riceve né conserva la relativa password.</p>
            </section>
            <section>
              <h2>Conservazione</h2>
              <p>I dati relativi alla richiesta e alla sandbox beta vengono conservati per il tempo necessario alla valutazione e comunque non oltre 12 mesi dall’ultimo contatto o dalla disattivazione, salvo obblighi di legge. I dati usati per aggiornamenti vengono conservati fino alla revoca del consenso e sottoposti a verifica periodica.</p>
            </section>
            <section>
              <h2>Destinatari e trasferimenti</h2>
              <p>I dati possono essere trattati da persone autorizzate e da fornitori di hosting, autenticazione, posta elettronica e servizi tecnici necessari, incluso OpenAI per l’accesso e l’hosting della beta. Qualora un fornitore comporti trasferimenti fuori dallo Spazio economico europeo, questi avverranno nel rispetto del Capo V del GDPR.</p>
            </section>
            <section>
              <h2>I tuoi diritti</h2>
              <p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità ove applicabile e opposizione. Puoi revocare in qualsiasi momento il consenso agli aggiornamenti scrivendo a <a href="mailto:cra24@kreluna.it">cra24@kreluna.it</a>, senza pregiudicare i trattamenti precedenti. Puoi inoltre presentare reclamo al Garante per la protezione dei dati personali.</p>
            </section>
          </div>
          <p className={styles.privacyCaution}>La sandbox pubblica usa esclusivamente dati sintetici. Non inserire dati riservati, personali o relativi a macchine e clienti reali. Prima di pilot con dati aziendali saranno concordati perimetro, ruoli, sicurezza, conservazione e condizioni applicabili.</p>
        </article>
      </main>
    </MarketingShell>
  );
}
