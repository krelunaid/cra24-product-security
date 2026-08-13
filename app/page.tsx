import type { Metadata } from "next";
import {
  ArrowRight,
  Boxes,
  Check,
  CircleDot,
  Clock3,
  FileCheck2,
  Fingerprint,
  GitBranch,
  Layers3,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import styles from "./marketing.module.css";

export const metadata: Metadata = {
  title: { absolute: "CRA24 — Product Security Operations, by Kreluna" },
  description:
    "Uno spazio operativo per trasformare vulnerabilità, componenti e famiglie macchina in impatto, azioni ed evidenze, prima delle scadenze CRA.",
};

const workflow = [
  {
    number: "01",
    title: "Raccogli il contesto",
    copy: "SBOM, componenti, fornitori, versioni e famiglie prodotto.",
  },
  {
    number: "02",
    title: "Correla l’impatto",
    copy: "Individua dove la vulnerabilità può essere presente usando dati aziendali validati.",
  },
  {
    number: "03",
    title: "Assegna e traccia",
    copy: "Riunisci priorità, responsabili, decisioni e scadenze nello stesso flusso.",
  },
  {
    number: "04",
    title: "Prepara l’evidenza",
    copy: "Costruisci una base ordinata per revisione e comunicazioni.",
  },
];

const audiences = [
  ["Product Security / PSIRT", "Triage, valutazione dell’impatto e coordinamento della risposta."],
  ["R&D e software", "Versioni coinvolte, correzioni e dipendenze ricostruite con chiarezza."],
  ["Compliance e qualità", "Decisioni, approvazioni ed evidenze mantenute nello stesso contesto."],
  ["Service e installato", "Famiglie prodotto e clienti potenzialmente interessati, quando i dati sono disponibili."],
];

export default function Home() {
  return (
    <MarketingShell>
      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.gridTexture} aria-hidden="true" />
          <div className={styles.heroInner}>
            <div className={styles.heroEyebrow}>
              <span className={styles.liveDot} />
              Product security operations
              <i />
              by Kreluna
            </div>
            <h1>
              Dalla vulnerabilità alle macchine coinvolte,
              <span> prima che scadano le prime 24 ore.</span>
            </h1>
            <p>
              CRA24 collega vulnerabilità, componenti, fornitori e famiglie prodotto.
              Aiuta il team a ricostruire l’impatto, coordinare le decisioni e preparare
              le evidenze per la risposta.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="/demo">
                Prova la demo <span>7 min</span> <ArrowRight size={17} />
              </a>
              <a className={styles.secondaryAction} href="/richiedi-beta">
                Richiedi un test sui tuoi dati
              </a>
            </div>
            <div className={styles.heroTrust}>
              <span><Check size={14} /> Scenario sintetico</span>
              <span><Check size={14} /> Nessun accesso a macchine reali</span>
              <span><Check size={14} /> Nessuna notifica inviata</span>
            </div>
          </div>

          <div className={styles.productStage} aria-label="Anteprima del flusso operativo CRA24">
            <div className={styles.stageChrome}>
              <div className={styles.stageBrand}>
                <span className={styles.tinyMark}>24</span>
                <strong>CRA24</strong>
                <small>Aster Packaging · scenario demo</small>
              </div>
              <div className={styles.stageMeta}>
                <span><CircleDot size={12} /> Dati sintetici</span>
                <i>AG</i>
              </div>
            </div>
            <div className={styles.stageBody}>
              <aside className={styles.stageRail}>
                <span className={styles.railActive}><Radio size={15} /> Incidente</span>
                <span><GitBranch size={15} /> Impatto</span>
                <span><Boxes size={15} /> Seriali</span>
                <span><FileCheck2 size={15} /> Dossier</span>
              </aside>
              <div className={styles.stageCanvas}>
                <div className={styles.stageHeadline}>
                  <div>
                    <small>INCIDENT ROOM · SCENARIO</small>
                    <h2>CVE-2026-48312</h2>
                    <p>Remote code execution in HMI Connect</p>
                  </div>
                  <div className={styles.deadlineMini}>
                    <span><Clock3 size={13} /> early warning</span>
                    <strong>T+24<small>h</small></strong>
                  </div>
                </div>

                <div className={styles.impactChain}>
                  <div className={`${styles.chainNode} ${styles.nodeSignal}`}>
                    <small>SEGNALE</small><strong>CVE</strong><span>CVSS 9.8</span>
                  </div>
                  <i><ArrowRight size={14} /></i>
                  <div className={styles.chainNode}>
                    <small>COMPONENTE</small><strong>HMI Connect</strong><span>v4.8.3</span>
                  </div>
                  <i><ArrowRight size={14} /></i>
                  <div className={styles.chainNode}>
                    <small>RELEASE</small><strong>FlexPack X7</strong><span>3 versioni</span>
                  </div>
                  <i><ArrowRight size={14} /></i>
                  <div className={`${styles.chainNode} ${styles.nodeResult}`}>
                    <small>IMPATTO</small><strong>127 seriali</strong><span>31 clienti</span>
                  </div>
                </div>

                <div className={styles.stageCards}>
                  <div>
                    <span className={styles.cardIcon}><Fingerprint size={16} /></span>
                    <p><small>EVIDENZA</small><strong>Versione verificata</strong></p>
                    <em>Confermata</em>
                  </div>
                  <div>
                    <span className={styles.cardIcon}><Users size={16} /></span>
                    <p><small>OWNER</small><strong>Laura Bianchi</strong></p>
                    <em>In revisione</em>
                  </div>
                  <div>
                    <span className={styles.cardIcon}><FileCheck2 size={16} /></span>
                    <p><small>DOSSIER</small><strong>4 evidenze</strong></p>
                    <em>Bozza</em>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.stageCaption}>Interfaccia della demo pubblica · dataset e numeri interamente fittizi</p>
        </section>

        <section className={styles.problemSection} id="prodotto">
          <div className={styles.sectionIntro}>
            <span className={styles.sectionKicker}>IL PROBLEMA OPERATIVO</span>
            <h2>Una CVE è solo l’inizio.</h2>
            <p>
              Il tempo si perde quando componenti, versioni, fornitori e prodotti installati
              vivono in file e sistemi separati. CRA24 riunisce il contesto necessario per
              trasformare un segnale tecnico in una decisione operativa.
            </p>
          </div>
          <div className={styles.valueGrid}>
            <article>
              <span><GitBranch size={20} /></span>
              <h3>Impatto</h3>
              <p>Collega la vulnerabilità alle versioni, ai componenti e alle famiglie prodotto potenzialmente coinvolte.</p>
              <small>VULNERABILITY → PRODUCT</small>
            </article>
            <article>
              <span><Users size={20} /></span>
              <h3>Decisione</h3>
              <p>Riunisce priorità, responsabile, scadenza e motivazione nello stesso flusso di lavoro.</p>
              <small>OWNER → ACTION</small>
            </article>
            <article>
              <span><FileCheck2 size={20} /></span>
              <h3>Evidenza</h3>
              <p>Organizza decisioni, azioni e documenti in un dossier verificabile dal team.</p>
              <small>DECISION → DOSSIER</small>
            </article>
          </div>
        </section>

        <section className={styles.workflowSection} id="come-funziona">
          <div className={styles.sectionIntroRow}>
            <div className={styles.sectionIntro}>
              <span className={styles.sectionKicker}>COME FUNZIONA</span>
              <h2>Dal segnale alla risposta, in un unico percorso.</h2>
            </div>
            <p>
              Non serve collegare le macchine per iniziare. Un pilot può partire da export
              ERP, PLM, CRM, SBOM o file concordati con l’azienda.
            </p>
          </div>
          <div className={styles.workflowGrid}>
            {workflow.map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <div className={styles.workflowLine} aria-hidden="true"><i /></div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
          <div className={styles.productModules}>
            <div><Radio size={17} /><span><b>Vulnerability Inbox</b><small>Valuta i segnali rilevanti</small></span></div>
            <div><Layers3 size={17} /><span><b>Product Impact Map</b><small>Dal componente alla macchina</small></span></div>
            <div><Users size={17} /><span><b>Response Room</b><small>Coordina persone e azioni</small></span></div>
            <div><FileCheck2 size={17} /><span><b>Evidence Dossier</b><small>Conserva il percorso decisionale</small></span></div>
          </div>
        </section>

        <section className={styles.nameSection} id="perche-cra24">
          <div className={styles.namePanel}>
            <div className={styles.nameLockup}>
              <div><span>CRA</span><small>Cyber Resilience Act</small></div>
              <i>+</i>
              <div className={styles.numberLockup}><span>24</span><small>prima finestra di allerta</small></div>
            </div>
            <div className={styles.nameCopy}>
              <span className={styles.sectionKicker}>PERCHÉ CRA24</span>
              <h2>CRA indica il regolamento. 24 indica il tempo che conta.</h2>
              <p>
                Dall’11 settembre 2026 si applicano gli obblighi di segnalazione dell’articolo 14.
                Nei casi previsti, l’allerta iniziale va trasmessa senza indebito ritardo e comunque
                entro 24 ore dalla presa di conoscenza; la notifica completa segue entro 72 ore.
              </p>
              <p>
                CRA24 non promette conformità automatica: è progettato per ridurre il tempo perso
                tra scoperta, analisi dell’impatto e coordinamento della risposta.
              </p>
              <a href="https://eur-lex.europa.eu/eli/reg/2024/2847/oj/ita" target="_blank" rel="noreferrer">
                Consulta il regolamento ufficiale <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className={styles.audienceSection}>
          <div className={styles.sectionIntro}>
            <span className={styles.sectionKicker}>UN CONTESTO CONDIVISO</span>
            <h2>Costruito per i team che devono rispondere insieme.</h2>
          </div>
          <div className={styles.audienceGrid}>
            {audiences.map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.transparencySection} id="trasparenza">
          <div className={styles.transparencyGlow} aria-hidden="true" />
          <div className={styles.transparencyIntro}>
            <span><ShieldCheck size={18} /> TRASPARENZA DELLA BETA</span>
            <h2>Una demo onesta, non una promessa mascherata.</h2>
            <p>
              CRA24 oggi dimostra un possibile modello operativo. Il valore della beta è
              verificare il flusso su un perimetro reale, senza fingere integrazioni che non esistono.
            </p>
          </div>
          <div className={styles.transparencyList}>
            <div><Check size={16} /><span><b>Dati interamente fittizi</b><small>Aster Packaging, persone, vulnerabilità e seriali sono sintetici.</small></span></div>
            <div><Check size={16} /><span><b>Nessun accesso agli impianti</b><small>La demo non interroga PLC, reti OT o sistemi aziendali.</small></span></div>
            <div><Check size={16} /><span><b>Nessuna azione esterna</b><small>Non invia comunicazioni a clienti, fornitori o autorità.</small></span></div>
            <div><Check size={16} /><span><b>Decisione umana obbligatoria</b><small>Non certifica la conformità e non sostituisce valutazioni legali o tecniche.</small></span></div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <span className={styles.finalIcon}><Sparkles size={20} /></span>
          <span className={styles.sectionKicker}>IL PROSSIMO PASSO</span>
          <h2>Parti da un caso concreto.</h2>
          <p>
            Esplora il flusso completo nella demo oppure proponi un caso pilota.
            Il primo contatto avviene per email, senza chiamate obbligatorie.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="/demo">Apri la demo <ArrowRight size={17} /></a>
            <a className={styles.lightAction} href="/richiedi-beta">Richiedi la beta</a>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
