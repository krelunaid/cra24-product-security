"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Gauge,
  Globe2,
  Inbox,
  LayoutDashboard,
  Link2,
  ListFilter,
  Mail,
  Menu,
  PackageCheck,
  Play,
  Plus,
  RotateCcw,
  Search,
  ServerCog,
  Settings,
  ShieldCheck,
  ShieldEllipsis,
  SlidersHorizontal,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type View =
  | "overview"
  | "incidents"
  | "assets"
  | "components"
  | "reports"
  | "integrations"
  | "settings";

type Incident = {
  id: number;
  cve: string;
  title: string;
  component: string;
  version: string;
  severity: "Critica" | "Alta" | "Media";
  status: "Triage" | "In corso" | "Monitoraggio" | "Chiuso";
  detected: string;
  serials: number;
  customers: number;
  owner: string;
  progress: number;
  summary: string;
};

type AssetStatus = "Da verificare" | "Patch pianificata" | "Mitigato" | "Non esposto";

type Asset = {
  id: string;
  model: string;
  customer: string;
  site: string;
  release: string;
  exposure: string;
  status: AssetStatus;
  selected?: boolean;
};

const initialIncidents: Incident[] = [
  {
    id: 1,
    cve: "CVE-2026-48312",
    title: "Remote code execution in HMI Connect",
    component: "HMI Connect Pro",
    version: "4.8.0–4.8.3",
    severity: "Critica",
    status: "In corso",
    detected: "Oggi, 08:42",
    serials: 127,
    customers: 31,
    owner: "Laura Bianchi",
    progress: 62,
    summary:
      "Una funzione di diagnostica remota può consentire l'esecuzione di codice senza autenticazione quando la porta di assistenza è esposta.",
  },
  {
    id: 2,
    cve: "CVE-2026-47105",
    title: "Authentication bypass in service gateway",
    component: "RemoteLink Gateway",
    version: "2.1.x",
    severity: "Alta",
    status: "Triage",
    detected: "Ieri, 16:18",
    serials: 48,
    customers: 12,
    owner: "Marco Riva",
    progress: 24,
    summary:
      "Il gateway di teleassistenza accetta token non firmati in una configurazione legacy ancora presente su alcune installazioni.",
  },
  {
    id: 3,
    cve: "CVE-2026-44987",
    title: "Outdated TLS stack in industrial IPC",
    component: "EdgeCore IPC",
    version: "OS image 7.3",
    severity: "Media",
    status: "Monitoraggio",
    detected: "08 ago 2026",
    serials: 214,
    customers: 57,
    owner: "Elena Conti",
    progress: 81,
    summary:
      "La libreria TLS inclusa nell'immagine di sistema richiede aggiornamento. Nessuna evidenza di sfruttamento rilevata.",
  },
  {
    id: 4,
    cve: "CVE-2026-39211",
    title: "Privilege escalation in PLC runtime",
    component: "MotionPLC Runtime",
    version: "11.2.4",
    severity: "Alta",
    status: "Chiuso",
    detected: "29 lug 2026",
    serials: 36,
    customers: 9,
    owner: "Paolo Neri",
    progress: 100,
    summary:
      "Scenario concluso: aggiornamento firmware simulato su tutti i seriali interessati. Esempio di dossier disponibile.",
  },
];

const initialAssets: Asset[] = [
  { id: "PKG-24-01874", model: "FlexPack X7", customer: "NordFoods GmbH", site: "Amburgo, DE", release: "5.12.4", exposure: "Remota", status: "Da verificare" },
  { id: "PKG-24-01792", model: "FlexPack X7", customer: "Alba Pharma S.p.A.", site: "Parma, IT", release: "5.12.4", exposure: "Remota", status: "Patch pianificata" },
  { id: "PKG-24-01631", model: "FlexPack X7", customer: "Maison Frais SAS", site: "Lione, FR", release: "5.11.9", exposure: "VPN cliente", status: "Mitigato" },
  { id: "PKG-23-01408", model: "FlexPack X5", customer: "Bergmann Foods", site: "Dresda, DE", release: "5.10.2", exposure: "Nessuna", status: "Non esposto" },
  { id: "PKG-23-01277", model: "FlexPack X7", customer: "Linea Verde S.r.l.", site: "Brescia, IT", release: "5.11.9", exposure: "Remota", status: "Da verificare" },
  { id: "PKG-23-01162", model: "FlexPack X5", customer: "Fjord Process AS", site: "Bergen, NO", release: "5.10.2", exposure: "VPN cliente", status: "Patch pianificata" },
  { id: "PKG-22-00984", model: "FlexPack X5", customer: "Dolciaria Uno", site: "Modena, IT", release: "5.9.8", exposure: "Remota", status: "Da verificare" },
  { id: "PKG-22-00841", model: "FlexPack X3", customer: "Helvetia Nutrition", site: "Basilea, CH", release: "4.16.1", exposure: "Nessuna", status: "Non esposto" },
];

const components = [
  { name: "HMI Connect Pro", supplier: "VisuTech", version: "4.8.3", products: 3, serials: 127, health: "Azione richiesta" },
  { name: "RemoteLink Gateway", supplier: "NexBridge", version: "2.1.7", products: 2, serials: 48, health: "Da verificare" },
  { name: "EdgeCore IPC", supplier: "Industrial Edge", version: "OS 7.3", products: 4, serials: 214, health: "Monitoraggio" },
  { name: "MotionPLC Runtime", supplier: "Motronix", version: "11.2.5", products: 5, serials: 486, health: "Nessun alert demo" },
  { name: "SafeMotion Library", supplier: "Internal", version: "3.7.1", products: 6, serials: 812, health: "Nessun alert demo" },
];

const reportRows = [
  { title: "Early warning — CVE-2026-48312", type: "CRA 24h", date: "13 ago 2026", state: "Bozza", owner: "Laura Bianchi" },
  { title: "Impact assessment — HMI Connect", type: "Impatto", date: "13 ago 2026", state: "In revisione", owner: "Marco Riva" },
  { title: "Dossier chiusura — CVE-2026-39211", type: "Esempio finale", date: "02 ago 2026", state: "Esempio", owner: "Paolo Neri" },
  { title: "Registro incidenti — Q2 2026", type: "Esempio registro", date: "30 giu 2026", state: "Esempio", owner: "Elena Conti" },
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Panoramica", icon: LayoutDashboard },
  { id: "incidents", label: "Incidenti", icon: AlertTriangle },
  { id: "assets", label: "Parco installato", icon: Box },
  { id: "components", label: "Componenti", icon: ServerCog },
  { id: "reports", label: "Dossier & report", icon: FileCheck2 },
];

const demoSteps = [
  {
    eyebrow: "1 · Segnale",
    title: "Parti da una vulnerabilità critica",
    copy: "Il caso dimostrativo riguarda un componente HMI vulnerabile. Osserva severità, versioni interessate e finestre operative 24/72 ore.",
    observe: "CRA24 non decide da solo: apre il caso e rende visibili urgenza, fonte e informazioni ancora da verificare.",
  },
  {
    eyebrow: "2 · Impatto",
    title: "Segui il collegamento fino al prodotto",
    copy: "L'impact graph collega CVE, componente, release di macchina, seriali e clienti potenzialmente coinvolti.",
    observe: "Il valore non è la CVE in sé, ma sapere dove quel componente è installato e con quale configurazione.",
  },
  {
    eyebrow: "3 · Priorità",
    title: "Distingui i seriali realmente esposti",
    copy: "Confronta macchine raggiungibili da remoto, accessibili via VPN e non esposte. Ogni riga conserva cliente, sito, release e stato operativo.",
    observe: "La demo usa dati fittizi. In un pilot queste informazioni arriverebbero da export ERP, PLM, CRM o file concordati.",
  },
  {
    eyebrow: "4 · Risposta",
    title: "Assegna il lavoro e controlla l'avanzamento",
    copy: "Il response plan separa rilevazione, mappatura, triage, notifica e remediation, mantenendo un responsabile umano per ogni decisione.",
    observe: "Nessuna comunicazione viene inviata automaticamente e nessun esito diventa definitivo senza revisione.",
  },
  {
    eyebrow: "5 · Evidenze",
    title: "Ricostruisci chi ha fatto cosa",
    copy: "La timeline mostra origine dell'advisory, completamento dell'impact graph, assegnazione del triage e contatto con il fornitore.",
    observe: "Questo registro è la base del dossier: fatti, responsabilità e decisioni restano separati dalle ipotesi.",
  },
  {
    eyebrow: "6 · Dossier",
    title: "Ottieni un risultato verificabile",
    copy: "La sezione finale raccoglie early warning, impact assessment, registro e dossier di chiusura in forma dimostrativa.",
    observe: "I documenti della beta non sono certificati, firmati o inviati alle autorità. Servono a validare struttura e workflow.",
  },
] as const;

function downloadFile(name: string, content: string, type = "application/json") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function statusClass(value: string) {
  return value.toLowerCase().replaceAll(" ", "-").replaceAll("à", "a");
}

function initialsFor(value: string) {
  const base = value.includes("@") ? value.split("@")[0] : value;
  const parts = base.trim().split(/[._\s-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : base.slice(0, 2)).toUpperCase();
}

export function CRA24App({
  currentUser,
  signOutPath,
  isAuthenticated,
}: {
  currentUser: { displayName: string; email: string };
  signOutPath?: string;
  isAuthenticated: boolean;
}) {
  const [view, setView] = useState<View>("overview");
  const [incidents, setIncidents] = useState(initialIncidents);
  const [assets, setAssets] = useState(initialAssets);
  const [activeIncidentId, setActiveIncidentId] = useState(1);
  const [incidentTab, setIncidentTab] = useState<"impact" | "assets" | "timeline">("impact");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newIncidentOpen, setNewIncidentOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoWelcomeOpen, setDemoWelcomeOpen] = useState(false);
  const [demoStep, setDemoStep] = useState<number | null>(null);
  const [demoCompleteOpen, setDemoCompleteOpen] = useState(false);
  const [demoActions, setDemoActions] = useState<Record<number, boolean>>({});
  const importRef = useRef<HTMLInputElement>(null);
  const currentUserInitials = initialsFor(currentUser.displayName);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedIncidents = localStorage.getItem("cra24-incidents");
      const savedAssets = localStorage.getItem("cra24-assets");
      if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
      if (savedAssets) setAssets(JSON.parse(savedAssets));
      if (!localStorage.getItem("cra24-guided-demo-v1-seen")) setDemoWelcomeOpen(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("cra24-incidents", JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem("cra24-assets", JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeIncident = incidents.find((incident) => incident.id === activeIncidentId) ?? incidents[0];
  const selectedAssets = assets.filter((asset) => asset.selected);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredAssets = assets.filter((asset) =>
    [asset.id, asset.model, asset.customer, asset.site, asset.status].join(" ").toLowerCase().includes(normalizedQuery),
  );
  const filteredIncidents = incidents.filter((incident) =>
    [incident.cve, incident.title, incident.component, incident.status].join(" ").toLowerCase().includes(normalizedQuery),
  );

  function navigate(next: View) {
    setView(next);
    setMobileOpen(false);
    setQuery("");
  }

  function notify(message: string) {
    setToast(message);
  }

  function startDemo() {
    localStorage.setItem("cra24-guided-demo-v1-seen", "true");
    setIncidents(initialIncidents.map((incident) => ({ ...incident })));
    setAssets(initialAssets.map((asset) => ({ ...asset, selected: false })));
    setDemoActions({});
    setDemoWelcomeOpen(false);
    setDemoCompleteOpen(false);
    setActiveIncidentId(1);
    setView("overview");
    setIncidentTab("impact");
    setDemoStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function exploreFreely() {
    localStorage.setItem("cra24-guided-demo-v1-seen", "true");
    setDemoWelcomeOpen(false);
    setDemoStep(null);
  }

  function moveDemo(next: number) {
    if (next < 0) return;
    if (next >= demoSteps.length) {
      setDemoStep(null);
      setDemoCompleteOpen(true);
      return;
    }

    setDemoStep(next);
    if (next === 0 || next === 1) {
      setView("overview");
      setIncidentTab("impact");
    } else if (next === 2 || next === 3) {
      setView("overview");
      setIncidentTab("assets");
    } else if (next === 4) {
      setView("overview");
      setIncidentTab("timeline");
    } else {
      setView("reports");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function performDemoAction() {
    if (demoStep === 2) {
      setAssets((current) => current.map((asset) => ({ ...asset, selected: asset.id === "PKG-24-01874" })));
      setDemoActions((current) => ({ ...current, 2: true }));
      notify("PKG-24-01874 selezionato nello scenario demo");
    }
    if (demoStep === 3) {
      setAssets((current) => current.map((asset) => asset.id === "PKG-24-01874" ? { ...asset, selected: false, status: "Patch pianificata" } : asset));
      setIncidents((current) => current.map((incident) => incident.id === 1 ? { ...incident, progress: 72 } : incident));
      setDemoActions((current) => ({ ...current, 3: true }));
      notify("Pianificazione registrata solo nella sessione demo");
    }
  }

  function updateIncidentStatus(status: Incident["status"], progress: number) {
    setIncidents((current) =>
      current.map((incident) => (incident.id === activeIncident.id ? { ...incident, status, progress } : incident)),
    );
    notify(status === "Chiuso" ? "Chiusura simulata e dossier demo aggiornato" : "Stato aggiornato nella sessione demo");
  }

  function patchSelected() {
    if (!selectedAssets.length) {
      notify("Seleziona almeno un seriale da aggiornare");
      return;
    }
    setAssets((current) =>
      current.map((asset) =>
        asset.selected ? { ...asset, selected: false, status: "Patch pianificata" as AssetStatus } : asset,
      ),
    );
    notify(`Patch pianificata per ${selectedAssets.length} seriali`);
  }

  function exportIncident() {
    const payload = {
      generatedAt: new Date().toISOString(),
      demo: true,
      disclaimer: "DEMO — dati fittizi — non certificato — non inviato",
      regulatoryWorkflow: "CRA Article 14 readiness",
      incident: activeIncident,
      affectedAssets: assets.filter((asset) => asset.status !== "Non esposto"),
      evidenceStatus: "Human review required before submission",
    };
    downloadFile(`CRA24-DEMO-${activeIncident.cve}-dossier.json`, JSON.stringify(payload, null, 2));
    notify("Dossier demo esportato: non certificato e non inviato");
  }

  function exportAssets() {
    const rows = [
      ["Seriale", "Modello", "Cliente", "Sito", "Release", "Esposizione", "Stato"],
      ...filteredAssets.map((asset) => [asset.id, asset.model, asset.customer, asset.site, asset.release, asset.exposure, asset.status]),
    ];
    downloadFile("CRA24-DEMO-parco-installato.csv", rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n"), "text/csv");
    notify("CSV demo esportato: contiene soltanto dati fittizi");
  }

  function importCsv(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter(Boolean).slice(1);
      const imported: Asset[] = lines.map((line, index) => {
        const [id, model, customer, site, release, exposure] = line.split(",").map((value) => value.trim().replace(/^"|"$/g, ""));
        return {
          id: id || `NEW-${Date.now()}-${index}`,
          model: model || "Modello da classificare",
          customer: customer || "Cliente da associare",
          site: site || "Sito non indicato",
          release: release || "N/D",
          exposure: exposure || "Da verificare",
          status: "Da verificare",
        };
      });
      if (!imported.length) {
        notify("Il file non contiene righe importabili");
        return;
      }
      setAssets((current) => [...imported, ...current]);
      notify(`${imported.length} seriali importati nella sola sessione locale`);
    };
    reader.readAsText(file);
  }

  function addIncident(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: Incident = {
      id: Date.now(),
      cve: String(form.get("cve") || "INC-NEW").toUpperCase(),
      title: String(form.get("title") || "Nuovo incidente"),
      component: String(form.get("component") || "Componente da identificare"),
      version: String(form.get("version") || "Da verificare"),
      severity: String(form.get("severity")) as Incident["severity"],
      status: "Triage",
      detected: "Adesso",
      serials: 0,
      customers: 0,
      owner: "Laura Bianchi",
      progress: 8,
      summary: String(form.get("summary") || "Analisi iniziale in corso."),
    };
    setIncidents((current) => [next, ...current]);
    setActiveIncidentId(next.id);
    setView("overview");
    setNewIncidentOpen(false);
    notify("Incident room demo creata. Nessun timer o invio reale è stato avviato.");
  }

  const viewTitle = {
    overview: "Centro operativo",
    incidents: "Incidenti",
    assets: "Parco installato",
    components: "Componenti software",
    reports: "Dossier & report",
    integrations: "Integrazioni",
    settings: "Impostazioni",
  }[view];

  return (
    <div className={`app-shell ${demoStep !== null ? "demo-mode" : ""}`}>
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><ShieldCheck size={19} strokeWidth={2.25} /></div>
          <div><strong>CRA<span>24</span></strong><small>Product Security Ops</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Chiudi menu"><X size={18} /></button>
        </div>

        <button className="workspace-switcher" title="Scenario interamente dimostrativo">
          <span className="workspace-avatar">AP</span>
          <span><small>Scenario demo</small><strong>Aster Packaging · fittizia</strong></span>
          <ChevronDown size={15} />
        </button>

        <nav aria-label="Navigazione principale">
          <span className="nav-label">Workspace</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
                <Icon size={18} /><span>{item.label}</span>
                {item.id === "incidents" && <em>3</em>}
              </button>
            );
          })}
          <span className="nav-label nav-label-spaced">Sistema</span>
          <button className={view === "integrations" ? "active" : ""} onClick={() => navigate("integrations")}><Link2 size={18} /><span>Integrazioni</span></button>
          <button className={view === "settings" ? "active" : ""} onClick={() => navigate("settings")}><Settings size={18} /><span>Impostazioni</span></button>
        </nav>

        <div className="sidebar-deadline">
          <div className="deadline-top"><span><Clock3 size={15} /> CRA reporting</span><em>Scenario</em></div>
          <div className="deadline-track"><span /></div>
          <p>Esempio del workflow applicabile dall&apos;11 settembre 2026. Nessun timer reale è attivo.</p>
          <button onClick={() => navigate("reports")}>Apri simulazione <ArrowRight size={14} /></button>
        </div>

        <div className="sidebar-user">
          <span className="user-avatar">{currentUserInitials}</span>
          <span><strong>{currentUser.displayName}</strong><small>{isAuthenticated ? "Utente autenticato" : "Accesso pubblico"}</small></span>
          <button aria-label="Impostazioni profilo" onClick={() => setProfileOpen((open) => !open)}><ChevronRight size={16} /></button>
        </div>
      </aside>

      {mobileOpen && <button className="mobile-scrim" aria-label="Chiudi menu" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-heading">
            <button onClick={() => setMobileOpen(true)} aria-label="Apri menu"><Menu size={20} /></button>
            <strong>{viewTitle}</strong>
          </div>
          <label className="global-search">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca CVE, seriale, cliente o componente…" />
            <kbd>⌘ K</kbd>
          </label>
          <div className="top-actions">
            <button className="demo-launch" onClick={startDemo}><Play size={14} fill="currentColor" /><span>Demo guidata</span></button>
            <span className="sync-state demo-data-state"><Database size={13} /> Dataset dimostrativo</span>
            <button className="icon-button" aria-label="Notifiche"><Bell size={18} /><i /></button>
            <button className="top-avatar" onClick={() => setProfileOpen((open) => !open)} aria-label="Apri profilo">{currentUserInitials}</button>
          </div>
          {profileOpen && (
            <div className="profile-popover">
              <div className="profile-identity"><span>{currentUserInitials}</span><div><strong>{currentUser.displayName}</strong><small>{currentUser.email}</small></div></div>
              <em><CheckCircle2 size={13} /> {isAuthenticated ? "Accesso verificato con ChatGPT" : "Demo pubblica · nessun login"}</em>
              <button onClick={() => { navigate("settings"); setProfileOpen(false); }}>Impostazioni workspace</button>
              {signOutPath && <a href={signOutPath}>Esci dall&apos;account</a>}
            </div>
          )}
        </header>

        <div className="demo-disclaimer-bar">
          <Database size={14} />
          <span><strong>Dataset dimostrativo</strong> · Aster Packaging, persone, macchine e vulnerabilità sono fittizie. Nessuna azione esterna.</span>
          <button onClick={startDemo}><Play size={12} fill="currentColor" /> Avvia percorso</button>
        </div>

        <div className="page-content">
          {view === "overview" && (
            <Overview
              incident={activeIncident}
              tab={incidentTab}
              setTab={setIncidentTab}
              assets={assets}
              selectedAssets={selectedAssets}
              setAssets={setAssets}
              patchSelected={patchSelected}
              exportIncident={exportIncident}
              updateIncidentStatus={updateIncidentStatus}
              openIncidents={() => navigate("incidents")}
              openAssets={() => navigate("assets")}
              newIncident={() => setNewIncidentOpen(true)}
              notify={notify}
              demoStep={demoStep}
              demoActionRecorded={Boolean(demoActions[3])}
            />
          )}

          {view === "incidents" && (
            <IncidentsView
              incidents={filteredIncidents}
              activeId={activeIncidentId}
              select={(id) => { setActiveIncidentId(id); setView("overview"); }}
              create={() => setNewIncidentOpen(true)}
            />
          )}

          {view === "assets" && (
            <AssetsView
              assets={filteredAssets}
              setAssets={setAssets}
              importCsv={() => importRef.current?.click()}
              exportAssets={exportAssets}
            />
          )}

          {view === "components" && <ComponentsView query={normalizedQuery} notify={notify} />}
          {view === "reports" && <ReportsView exportIncident={exportIncident} notify={notify} demoStep={demoStep} />}
          {view === "integrations" && <IntegrationsView notify={notify} />}
          {view === "settings" && <SettingsView notify={notify} />}
        </div>
      </main>

      <input ref={importRef} className="hidden-input" type="file" accept=".csv,text/csv" onChange={(event) => importCsv(event.target.files?.[0])} />

      {newIncidentOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card" onSubmit={addIncident}>
            <div className="modal-head"><div><span className="eyebrow">Nuova segnalazione</span><h2>Apri un&apos;incident room</h2></div><button type="button" onClick={() => setNewIncidentOpen(false)} aria-label="Chiudi"><X size={19} /></button></div>
            <p className="modal-intro">Inserisci le informazioni già disponibili. CRA24 simulerà il triage e conserverà le modifiche soltanto nella sessione locale.</p>
            <div className="form-grid">
              <label><span>Identificativo</span><input name="cve" placeholder="CVE-2026-00000" required /></label>
              <label><span>Severità</span><select name="severity" defaultValue="Alta"><option>Critica</option><option>Alta</option><option>Media</option></select></label>
              <label className="full"><span>Titolo</span><input name="title" placeholder="Descrizione sintetica della vulnerabilità" required /></label>
              <label><span>Componente</span><input name="component" placeholder="HMI, PLC, gateway…" required /></label>
              <label><span>Versione</span><input name="version" placeholder="es. 4.8.0–4.8.3" /></label>
              <label className="full"><span>Informazioni iniziali</span><textarea name="summary" rows={3} placeholder="Fonte, condizioni di esposizione e informazioni già verificate" /></label>
            </div>
            <div className="modal-actions"><button type="button" className="button secondary" onClick={() => setNewIncidentOpen(false)}>Annulla</button><button className="button primary" type="submit"><Zap size={16} /> Avvia triage</button></div>
          </form>
        </div>
      )}

      {demoWelcomeOpen && <DemoWelcome start={startDemo} explore={exploreFreely} />}
      {demoStep !== null && (
        <DemoGuide
          step={demoStep}
          previous={() => moveDemo(demoStep - 1)}
          next={() => moveDemo(demoStep + 1)}
          close={() => setDemoStep(null)}
          restart={startDemo}
          action={demoStep === 2 || demoStep === 3 ? performDemoAction : undefined}
          actionDone={Boolean(demoActions[demoStep])}
        />
      )}
      {demoCompleteOpen && (
        <DemoComplete
          replay={startDemo}
          close={() => setDemoCompleteOpen(false)}
        />
      )}

      {toast && <div className="toast"><CheckCircle2 size={18} /><span>{toast}</span></div>}
    </div>
  );
}

function DemoWelcome({ start, explore }: { start: () => void; explore: () => void }) {
  return (
    <div className="demo-welcome-backdrop">
      <section className="demo-welcome-card" role="dialog" aria-modal="true" aria-labelledby="demo-welcome-title">
        <div className="demo-welcome-top">
          <span className="demo-beta-label"><span /> Beta privata · circa 7 minuti</span>
          <button onClick={explore} aria-label="Chiudi introduzione"><X size={18} /></button>
        </div>
        <div className="demo-welcome-copy">
          <span className="eyebrow">Scenario guidato</span>
          <h2 id="demo-welcome-title">Da una vulnerabilità HMI alle macchine da gestire</h2>
          <p>Assumi il ruolo del responsabile product security di un costruttore di macchine. È appena arrivato un advisory critico: devi capire quali prodotti sono coinvolti, dare priorità ai seriali esposti e preparare una risposta documentata.</p>
        </div>
        <div className="demo-scenario">
          <div><small>VULNERABILITÀ</small><strong>CVE-2026-48312</strong><span>HMI Connect Pro 4.8.0–4.8.3</span></div>
          <ArrowRight size={18} />
          <div><small>IMPATTO DIMOSTRATIVO</small><strong>127 seriali · 31 clienti</strong><span>89 installazioni esposte da remoto</span></div>
        </div>
        <div className="demo-trust-grid">
          <div><Database size={18} /><span><strong>Dati sintetici</strong><small>Nessun cliente o macchinario reale</small></span></div>
          <div><ShieldCheck size={18} /><span><strong>Nessun accesso agli impianti</strong><small>La demo non interroga sistemi esterni</small></span></div>
          <div><CheckCircle2 size={18} /><span><strong>Decisione umana</strong><small>Nessun invio o verdetto automatico</small></span></div>
        </div>
        <div className="demo-route" aria-label="Percorso della demo">
          {demoSteps.map((step, index) => <span key={step.title}><b>{index + 1}</b>{step.eyebrow.split("·")[1]}</span>)}
        </div>
        <div className="demo-welcome-actions">
          <button className="button secondary" onClick={explore}>Esplora liberamente</button>
          <button className="button primary" onClick={start}><Play size={15} fill="currentColor" /> Inizia la demo guidata</button>
        </div>
      </section>
    </div>
  );
}

function DemoGuide({ step, previous, next, close, restart, action, actionDone }: { step: number; previous: () => void; next: () => void; close: () => void; restart: () => void; action?: () => void; actionDone: boolean }) {
  const content = demoSteps[step];
  const actionLabel = step === 2 ? "Seleziona un seriale esposto" : "Pianifica la patch demo";
  return (
    <aside className="demo-guide" role="dialog" aria-label={`Demo guidata, passaggio ${step + 1} di ${demoSteps.length}`}>
      <div className="demo-guide-head">
        <span>{content.eyebrow}</span>
        <div>
          <button onClick={restart} aria-label="Ricomincia demo"><RotateCcw size={15} /></button>
          <button onClick={close} aria-label="Chiudi demo"><X size={16} /></button>
        </div>
      </div>
      <div className="demo-progress" aria-hidden="true">
        {demoSteps.map((item, index) => <i key={item.title} className={index <= step ? "complete" : ""} />)}
      </div>
      <h3>{content.title}</h3>
      <p>{content.copy}</p>
      <div className="demo-observe"><Eye size={16} /><span><b>Cosa osservare</b>{content.observe}</span></div>
      {action && <button className={`demo-action ${actionDone ? "done" : ""}`} onClick={action} disabled={actionDone}>{actionDone ? <Check size={15} /> : <Play size={14} fill="currentColor" />}{actionDone ? "Azione completata" : actionLabel}</button>}
      <div className="demo-guide-actions">
        <button className="button secondary" onClick={previous} disabled={step === 0}>Indietro</button>
        <button className="button primary" onClick={next} disabled={Boolean(action && !actionDone)}>{step === demoSteps.length - 1 ? "Concludi demo" : "Continua"}<ArrowRight size={15} /></button>
      </div>
    </aside>
  );
}

function DemoComplete({ replay, close }: { replay: () => void; close: () => void }) {
  const feedbackBody = [
    "Buongiorno, ho provato la demo CRA24.",
    "",
    "1. Oggi come individuate i seriali coinvolti da una vulnerabilità?",
    "Risposta: ",
    "",
    "2. Quale passaggio della demo sarebbe più utile nel vostro processo?",
    "Risposta: ",
    "",
    "3. Cosa manca per poterla testare su una famiglia di macchine?",
    "Risposta: ",
  ].join("\n");
  const feedbackHref = `mailto:cra24@kreluna.it?subject=${encodeURIComponent("Feedback demo CRA24")}&body=${encodeURIComponent(feedbackBody)}`;

  return (
    <div className="demo-welcome-backdrop">
      <section className="demo-complete-card" role="dialog" aria-modal="true" aria-labelledby="demo-complete-title">
        <span className="demo-complete-icon"><CheckCircle2 size={24} /></span>
        <span className="eyebrow">Percorso completato</span>
        <h2 id="demo-complete-title">Ora vogliamo capire il vostro processo reale</h2>
        <p>La demo ha mostrato il flusso completo senza usare dati aziendali. Una risposta via email è sufficiente: non è necessario fissare una chiamata.</p>
        <div className="demo-question-list">
          <span><b>1</b>Come individuate oggi i seriali coinvolti?</span>
          <span><b>2</b>Quale passaggio vi farebbe risparmiare più tempo?</span>
          <span><b>3</b>Cosa manca per provare una famiglia di macchine?</span>
        </div>
        <a className="button primary demo-mail-button" href={feedbackHref}><Mail size={16} /> Prepara la risposta email</a>
        <div className="demo-complete-actions"><button onClick={replay}><RotateCcw size={14} /> Rivedi demo</button><button onClick={close}>Continua a esplorare</button></div>
        <small>Nessun dato della prova viene inviato automaticamente a CRA24.</small>
      </section>
    </div>
  );
}

function Overview({ incident, tab, setTab, assets, selectedAssets, setAssets, patchSelected, exportIncident, updateIncidentStatus, openIncidents, openAssets, newIncident, notify, demoStep, demoActionRecorded }: {
  incident: Incident;
  tab: "impact" | "assets" | "timeline";
  setTab: (tab: "impact" | "assets" | "timeline") => void;
  assets: Asset[];
  selectedAssets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  patchSelected: () => void;
  exportIncident: () => void;
  updateIncidentStatus: (status: Incident["status"], progress: number) => void;
  openIncidents: () => void;
  openAssets: () => void;
  newIncident: () => void;
  notify: (message: string) => void;
  demoStep: number | null;
  demoActionRecorded: boolean;
}) {
  const affected = assets.filter((asset) => asset.status !== "Non esposto");
  return (
    <>
      <section className="page-heading">
        <div><span className="eyebrow">Giovedì 13 agosto 2026</span><h1>Centro operativo</h1><p>Una vista unica su vulnerabilità, prodotti coinvolti e risposta normativa.</p></div>
        <div className="heading-actions"><button className="button secondary" onClick={exportIncident}><Download size={16} /> Esporta dossier</button><button className="button primary" onClick={newIncident}><Plus size={17} /> Nuovo incidente</button></div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card"><div className="metric-icon danger"><AlertTriangle size={18} /></div><div><span>Incidenti aperti</span><strong>3</strong><small><b>1 critico</b> richiede attenzione</small></div></article>
        <article className="metric-card"><div className="metric-icon ink"><Box size={18} /></div><div><span>Seriali nello scenario</span><strong>2.418</strong><small>6 famiglie dimostrative</small></div></article>
        <article className="metric-card"><div className="metric-icon amber"><Activity size={18} /></div><div><span>Seriali demo da valutare</span><strong>127</strong><small>31 clienti fittizi coinvolti</small></div></article>
        <article className="metric-card readiness"><div className="metric-icon green"><Gauge size={18} /></div><div><span>Copertura workflow demo</span><strong>82%</strong><small>4 passaggi ancora da simulare</small></div><div className="metric-ring" style={{ "--value": "82%" } as React.CSSProperties}><span>82</span></div></article>
      </section>

      <section className={`incident-hero ${demoStep === 0 ? "demo-focus" : ""}`}>
        <div className="incident-summary">
          <div className="incident-kicker"><span className="live-pulse" /> INCIDENTE PRIORITARIO <span>Rilevato {incident.detected.toLowerCase()}</span></div>
          <div className="incident-title-row"><div><div className="incident-id-row"><code>{incident.cve}</code><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span><span className={`status ${statusClass(incident.status)}`}>{incident.status}</span></div><h2>{incident.title}</h2><p>{incident.summary}</p></div><button className="round-action" onClick={openIncidents} aria-label="Apri tutti gli incidenti"><ArrowRight size={19} /></button></div>
          <div className="incident-meta"><span><ServerCog size={15} /><b>{incident.component}</b> {incident.version}</span><span><Users size={15} />Owner: <b>{incident.owner}</b></span></div>
        </div>
        <div className="deadline-panel">
          <div className="deadline-heading"><Clock3 size={17} /><span>CRA Article 14</span><em>Timer simulato</em></div>
          <div className="countdown"><div><small>EARLY WARNING · ENTRO 24H</small><strong>T+24<span>h</span></strong><p>Finestra dello scenario</p></div><div><small>NOTIFICA COMPLETA · ENTRO 72H</small><strong>T+72<span>h</span></strong><p>Finestra dello scenario</p></div></div>
          <div className="deadline-actions"><button onClick={() => notify("Bozza demo aperta: nessun invio effettuato")}><FileText size={15} /> Apri bozza demo</button><button onClick={() => notify("Simulazione registrata: nessun responsabile contattato")}>Simula avviso</button></div>
        </div>
      </section>

      <section className="workspace-grid">
        <article className="panel incident-workspace">
          <div className="tabs-row" role="tablist">
            <button className={tab === "impact" ? "active" : ""} onClick={() => setTab("impact")}>Impatto</button>
            <button className={tab === "assets" ? "active" : ""} onClick={() => setTab("assets")}>Seriali coinvolti <span>{incident.serials}</span></button>
            <button className={tab === "timeline" ? "active" : ""} onClick={() => setTab("timeline")}>Timeline</button>
            <button className="more-button" aria-label="Altre opzioni"><SlidersHorizontal size={17} /></button>
          </div>

          {tab === "impact" && (
            <div className="impact-content">
              <div className={`impact-map ${demoStep === 1 ? "demo-focus" : ""}`}>
                <div className="map-node source"><span><AlertTriangle size={17} /></span><div><small>VULNERABILITÀ · SCENARIO</small><strong>{incident.cve}</strong><em>CVSS 9.8 · dato dimostrativo</em></div></div>
                <div className="map-connector"><span /></div>
                <div className="map-node component"><span><ServerCog size={17} /></span><div><small>COMPONENTE</small><strong>{incident.component}</strong><em>{incident.version}</em></div><b>1</b></div>
                <div className="map-connector split"><span /><i /><i /></div>
                <div className="map-branch-row">
                  <div className="map-node compact"><span><PackageCheck size={16} /></span><div><small>RELEASE</small><strong>3 versioni</strong><em>5.10 → 5.12</em></div></div>
                  <div className="map-node compact hot"><span><Box size={16} /></span><div><small>SERIALI</small><strong>{incident.serials} coinvolti</strong><em>89 esposti da remoto</em></div></div>
                  <div className="map-node compact"><span><Users size={16} /></span><div><small>CLIENTI</small><strong>{incident.customers} aziende</strong><em>7 Paesi europei</em></div></div>
                </div>
              </div>
              <div className="evidence-list">
                <h3>Evidenze simulate</h3>
                <div><CheckCircle2 size={17} /><span><b>Componente presente nello scenario</b><small>Fingerprint demo associato a 127 seriali</small></span></div>
                <div><CheckCircle2 size={17} /><span><b>Vettore raggiungibile nello scenario</b><small>89 gateway fittizi risultano esposti</small></span></div>
                <div className="pending"><CircleDot size={17} /><span><b>Exploitability review</b><small>Revisione umana in corso · Laura Bianchi</small></span></div>
                <div className="muted"><Clock3 size={17} /><span><b>Conferma del fornitore</b><small>Esempio in attesa · nessuna richiesta reale inviata</small></span></div>
              </div>
            </div>
          )}

          {tab === "assets" && (
            <div className={`asset-mini-table ${demoStep === 2 ? "demo-focus" : ""}`}>
              <div className="bulk-bar"><span>{selectedAssets.length ? `${selectedAssets.length} selezionati` : `${affected.length} seriali da gestire`}</span><button onClick={patchSelected}><PackageCheck size={15} /> Pianifica patch</button><button onClick={openAssets}>Apri registro completo</button></div>
              <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Seleziona tutti" checked={selectedAssets.length === affected.length && affected.length > 0} onChange={(event) => setAssets((current) => current.map((asset) => ({ ...asset, selected: asset.status !== "Non esposto" ? event.target.checked : false })))} /></th><th>Seriale</th><th>Cliente / sito</th><th>Release</th><th>Esposizione</th><th>Stato</th></tr></thead><tbody>{assets.slice(0, 6).map((asset) => <AssetRow key={asset.id} asset={asset} toggle={() => setAssets((current) => current.map((row) => row.id === asset.id ? { ...row, selected: !row.selected } : row))} />)}</tbody></table></div>
            </div>
          )}

          {tab === "timeline" && (
            <div className={`timeline-list ${demoStep === 4 ? "demo-focus" : ""}`}>
              <TimelineItem time="08:42" title="Vulnerabilità acquisita" copy="Advisory fittizio collegato al componente HMI Connect Pro dello scenario." icon={<Inbox size={16} />} />
              <TimelineItem time="08:47" title="Impact graph completato" copy="127 seriali e 31 clienti identificati sulle release 5.10–5.12." icon={<Link2 size={16} />} />
              <TimelineItem time="09:06" title="Triage assegnato" copy="Laura Bianchi ha preso in carico la valutazione di exploitability." icon={<Users size={16} />} />
              <TimelineItem time="09:28" title="Contatto fornitore simulato" copy="Esempio di richiesta patch: nessun messaggio esterno è stato inviato." icon={<Bell size={16} />} pending />
              {demoActionRecorded && <TimelineItem time="Adesso" title="Pianificazione demo registrata" copy="Patch pianificata per PKG-24-01874 nella sola sessione locale. Nessun messaggio esterno inviato." icon={<PackageCheck size={16} />} />}
            </div>
          )}
        </article>

        <aside className={`panel response-panel ${demoStep === 3 ? "demo-focus" : ""}`}>
          <div className="panel-heading"><div><span className="eyebrow">Response plan</span><h3>Avanzamento risposta</h3></div><strong>{incident.progress}%</strong></div>
          <div className="progress-track"><span style={{ width: `${incident.progress}%` }} /></div>
          <div className="response-steps">
            <ResponseStep done label="Rilevazione & registrazione" meta="Completato · 08:42" />
            <ResponseStep done label="Mappatura impatto" meta="127 seriali identificati" />
            <ResponseStep active label="Triage tecnico" meta="3 verifiche su 4 completate" />
            <ResponseStep label="Notifica 24h" meta="Bozza pronta per revisione" />
            <ResponseStep label="Remediation" meta="In attesa della patch vendor" />
          </div>
          <div className="response-footer">
            {incident.status === "Triage" && <button className="button primary wide" onClick={() => updateIncidentStatus("In corso", 36)}>Avvia valutazione <ArrowRight size={16} /></button>}
            {incident.status !== "Triage" && incident.status !== "Chiuso" && <button className="button primary wide" onClick={() => updateIncidentStatus("Monitoraggio", 81)}>Conferma triage <ArrowRight size={16} /></button>}
            {incident.status === "Monitoraggio" && <button className="button secondary wide" onClick={() => updateIncidentStatus("Chiuso", 100)}>Chiudi incidente</button>}
            {incident.status === "Chiuso" && <button className="button secondary wide" onClick={exportIncident}><Download size={16} /> Scarica esempio dossier</button>}
            <small>Le azioni della beta restano nella sessione locale del browser.</small>
          </div>
        </aside>
      </section>

      <section className="bottom-grid">
        <article className="panel recent-panel"><div className="section-title"><div><h3>Incidenti recenti</h3><p>Attività sulle altre linee di prodotto</p></div><button onClick={openIncidents}>Vedi tutti <ArrowRight size={15} /></button></div><div className="recent-row"><span className="severity-dot high" /><div><strong>CVE-2026-47105</strong><small>RemoteLink Gateway · FlexPack X5</small></div><span>48 seriali</span><em className="status triage">Triage</em><ChevronRight size={16} /></div><div className="recent-row"><span className="severity-dot medium" /><div><strong>CVE-2026-44987</strong><small>EdgeCore IPC · 4 modelli</small></div><span>214 seriali</span><em className="status monitoraggio">Monitoraggio</em><ChevronRight size={16} /></div></article>
        <article className="panel coverage-panel"><div className="section-title"><div><h3>Copertura dati demo</h3><p>Qualità del grafo simulato</p></div><button onClick={openAssets}>Dettagli</button></div><div className="coverage-main"><div className="coverage-ring"><strong>94%</strong><span>scenario</span></div><div><p><span className="dot green" />Seriali con release nota <b>2.276</b></p><p><span className="dot amber" />Da classificare <b>98</b></p><p><span className="dot gray" />Dati insufficienti <b>44</b></p></div></div></article>
      </section>
    </>
  );
}

function IncidentsView({ incidents, activeId, select, create }: { incidents: Incident[]; activeId: number; select: (id: number) => void; create: () => void }) {
  const [severity, setSeverity] = useState("Tutte");
  const visible = incidents.filter((incident) => severity === "Tutte" || incident.severity === severity);
  return <>
    <section className="page-heading"><div><span className="eyebrow">Product security</span><h1>Incidenti</h1><p>Valuta, coordina e documenta ogni evento lungo l&apos;intero ciclo CRA.</p></div><button className="button primary" onClick={create}><Plus size={17} /> Nuovo incidente</button></section>
    <div className="filter-row"><div className="segmented">{["Tutte", "Critica", "Alta", "Media"].map((item) => <button key={item} className={severity === item ? "active" : ""} onClick={() => setSeverity(item)}>{item}</button>)}</div><button className="button secondary compact"><ListFilter size={15} /> Filtri</button></div>
    <section className="incident-list">{visible.map((incident) => <button key={incident.id} className={`incident-list-card ${activeId === incident.id ? "selected" : ""}`} onClick={() => select(incident.id)}><span className={`incident-severity-bar ${incident.severity.toLowerCase()}`} /><div className="incident-list-main"><div><code>{incident.cve}</code><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span><span className={`status ${statusClass(incident.status)}`}>{incident.status}</span></div><h3>{incident.title}</h3><p>{incident.component} · {incident.version}</p></div><div className="incident-list-impact"><span><Box size={15} />{incident.serials} seriali</span><span><Users size={15} />{incident.customers} clienti</span></div><div className="incident-list-progress"><span>{incident.progress}%</span><div><i style={{ width: `${incident.progress}%` }} /></div><small>{incident.owner}</small></div><ChevronRight size={18} /></button>)}</section>
  </>;
}

function AssetsView({ assets, setAssets, importCsv, exportAssets }: { assets: Asset[]; setAssets: React.Dispatch<React.SetStateAction<Asset[]>>; importCsv: () => void; exportAssets: () => void }) {
  const [status, setStatus] = useState("Tutti gli stati");
  const visible = assets.filter((asset) => status === "Tutti gli stati" || asset.status === status);
  return <>
    <section className="page-heading"><div><span className="eyebrow">Installed base · dati demo</span><h1>Parco installato</h1><p>Configurazioni fittizie usate per provare la mappatura. Un CSV importato resta soltanto nel browser.</p></div><div className="heading-actions"><button className="button secondary" onClick={exportAssets}><Download size={16} /> Esporta CSV demo</button><button className="button primary" onClick={importCsv}><Upload size={16} /> Importa CSV locale</button></div></section>
    <section className="asset-summary"><div><strong>2.418</strong><span>Seriali demo</span></div><div><strong>2.276</strong><span>Release note nello scenario</span></div><div><strong>98</strong><span>Da classificare</span></div><div><strong>14</strong><span>Paesi simulati</span></div></section>
    <section className="panel registry-panel"><div className="registry-toolbar"><div><h3>Registro macchine</h3><span>{visible.length} risultati visualizzati</span></div><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Tutti gli stati</option><option>Da verificare</option><option>Patch pianificata</option><option>Mitigato</option><option>Non esposto</option></select></div><div className="table-scroll"><table className="registry-table"><thead><tr><th><input type="checkbox" aria-label="Seleziona tutti" /></th><th>Seriale / modello</th><th>Cliente / sito</th><th>Release</th><th>Esposizione</th><th>Stato</th><th /></tr></thead><tbody>{visible.map((asset) => <AssetRow key={asset.id} asset={asset} toggle={() => setAssets((current) => current.map((row) => row.id === asset.id ? { ...row, selected: !row.selected } : row))} />)}</tbody></table></div></section>
  </>;
}

function AssetRow({ asset, toggle }: { asset: Asset; toggle: () => void }) {
  return <tr><td><input type="checkbox" checked={Boolean(asset.selected)} onChange={toggle} aria-label={`Seleziona ${asset.id}`} /></td><td><strong>{asset.id}</strong><small>{asset.model}</small></td><td><strong>{asset.customer}</strong><small>{asset.site}</small></td><td><code>{asset.release}</code></td><td><span className={`exposure ${asset.exposure === "Remota" ? "remote" : ""}`}>{asset.exposure}</span></td><td><em className={`asset-status ${statusClass(asset.status)}`}>{asset.status}</em></td><td><button className="row-action" aria-label={`Apri ${asset.id}`}><ChevronRight size={16} /></button></td></tr>;
}

function ComponentsView({ query, notify }: { query: string; notify: (message: string) => void }) {
  const visible = components.filter((item) => [item.name, item.supplier, item.version].join(" ").toLowerCase().includes(query));
  return <><section className="page-heading"><div><span className="eyebrow">Software supply chain · scenario demo</span><h1>Componenti software</h1><p>Dipendenze, fornitori e versioni fittizie collegate ai prodotti dello scenario.</p></div><button className="button secondary" disabled title="La connessione SBOM verrà verificata in un eventuale pilot"><Upload size={16} /> SBOM disponibile nel pilot</button></section><section className="component-grid">{visible.map((item) => <article className="component-card" key={item.name}><div className="component-top"><span><ServerCog size={19} /></span><em className={`component-health ${statusClass(item.health)}`}>{item.health}</em></div><h3>{item.name}</h3><p>{item.supplier} · <code>{item.version}</code></p><div className="component-stats"><span><small>PRODOTTI DEMO</small><strong>{item.products}</strong></span><span><small>SERIALI DEMO</small><strong>{item.serials}</strong></span></div><button onClick={() => notify(`Anteprima del grafo demo di ${item.name}`)}>Apri impact graph <ArrowRight size={15} /></button></article>)}</section></>;
}

function ReportsView({ exportIncident, notify, demoStep }: { exportIncident: () => void; notify: (message: string) => void; demoStep: number | null }) {
  return <><section className="page-heading"><div><span className="eyebrow">Evidence vault · dati demo</span><h1>Dossier & report</h1><p>Documenti dimostrativi organizzati per la revisione umana.</p></div><button className="button primary" onClick={exportIncident}><FileCheck2 size={16} /> Genera dossier demo</button></section><section className={`report-callout ${demoStep === 5 ? "demo-focus" : ""}`}><div className="report-callout-icon"><ShieldEllipsis size={25} /></div><div><span>Simulazione CRA</span><h2>Il workflow di risposta è configurato all&apos;82%</h2><p>I documenti mostrati non sono certificati, firmati o inviati: servono a validare struttura e processo.</p></div><button onClick={() => notify("Checklist dimostrativa aperta")}>Vedi checklist <ArrowRight size={16} /></button></section><section className="panel reports-table"><div className="section-title"><div><h3>Documenti dello scenario</h3><p>Bozze, assessment ed esempi di dossier</p></div><button><ListFilter size={15} /> Filtra</button></div>{reportRows.map((report) => <div className="report-row" key={report.title}><span className="report-icon"><FileText size={18} /></span><div><strong>{report.title}</strong><small>{report.type} · {report.date}</small></div><span>{report.owner}</span><em className={`report-state ${statusClass(report.state)}`}>{report.state}</em><button onClick={() => notify(`${report.title}: anteprima dimostrativa`)} aria-label={`Apri ${report.title}`}><Download size={16} /></button></div>)}</section></>;
}

function IntegrationsView({ notify }: { notify: (message: string) => void }) {
  const items = [
    { icon: <Box size={20} />, name: "ERP / PLM", copy: "Seriali, distinte e configurazioni prodotto", state: "Simulato", detail: "Nessuna connessione attiva nella beta" },
    { icon: <ServerCog size={20} />, name: "SBOM Pipeline", copy: "CycloneDX, SPDX e scanner esistenti", state: "Simulato", detail: "Il dataset dimostra il risultato atteso" },
    { icon: <Users size={20} />, name: "CRM & Service", copy: "Clienti, siti installati e referenti", state: "Simulato", detail: "Clienti e asset sono interamente fittizi" },
    { icon: <Globe2 size={20} />, name: "CRA Single Reporting Platform", copy: "Preparazione pacchetto per invio autorizzato", state: "Previsto nel pilot", detail: "Nessun invio automatico nella beta" },
  ];
  return <><section className="page-heading"><div><span className="eyebrow">Data fabric · architettura proposta</span><h1>Integrazioni</h1><p>Questa pagina illustra le fonti previste: nella beta nessun sistema aziendale è collegato.</p></div></section><section className="integration-list">{items.map((item) => <article className="integration-card" key={item.name}><span className="integration-icon">{item.icon}</span><div><h3>{item.name}</h3><p>{item.copy}</p><small>{item.detail}</small></div><em className={item.state === "Simulato" ? "simulated" : "configure"}><span />{item.state}</em><button className="button secondary compact" onClick={() => notify(`${item.name}: flusso illustrativo, connettore non attivo`)}>Come funzionerebbe</button></article>)}</section></>;
}

function SettingsView({ notify }: { notify: (message: string) => void }) {
  const [humanApproval, setHumanApproval] = useState(true);
  const [notifications, setNotifications] = useState(true);
  return <><section className="page-heading"><div><span className="eyebrow">Workspace</span><h1>Impostazioni</h1><p>Regole operative, approvazioni e contatti del processo di risposta.</p></div><button className="button primary" onClick={() => notify("Impostazioni salvate")}>Salva modifiche</button></section><section className="settings-grid"><article className="panel settings-card"><div><h3>Governance</h3><p>Controlli prima della generazione dei documenti.</p></div><SettingToggle label="Approvazione umana obbligatoria" copy="Nessuna valutazione o comunicazione viene marcata come finale senza un approvatore." value={humanApproval} onChange={setHumanApproval} /><SettingToggle label="Escalation automatica" copy="Avvisa il responsabile quando rimangono meno di 6 ore alla scadenza." value={notifications} onChange={setNotifications} /></article><article className="panel settings-card"><div><h3>Referenti CRA</h3><p>Persone autorizzate a coordinare e approvare la risposta.</p></div><div className="contact-row"><span>LB</span><div><strong>Laura Bianchi</strong><small>Referente principale</small></div><em>Attivo</em></div><div className="contact-row"><span>MR</span><div><strong>Marco Riva</strong><small>Referente sostitutivo</small></div><em className="pending">Da verificare</em></div><button className="text-button" onClick={() => notify("Invito referente preparato")}><Plus size={15} /> Aggiungi referente</button></article><article className="panel settings-card full"><div><h3>Principio di sicurezza</h3><p>CRA24 supporta le decisioni, non sostituisce il giudizio tecnico o legale.</p></div><div className="safety-rule"><ShieldCheck size={22} /><div><strong>Evidence before confidence</strong><p>Quando i dati non sono sufficienti, il sistema mostra “evidenza insufficiente” e impedisce qualsiasi esito verde automatico.</p></div><span>Attivo</span></div></article></section></>;
}

function SettingToggle({ label, copy, value, onChange }: { label: string; copy: string; value: boolean; onChange: (value: boolean) => void }) {
  return <div className="setting-row"><div><strong>{label}</strong><p>{copy}</p></div><button className={`toggle ${value ? "on" : ""}`} onClick={() => onChange(!value)} aria-pressed={value}><span /></button></div>;
}

function TimelineItem({ time, title, copy, icon, pending }: { time: string; title: string; copy: string; icon: React.ReactNode; pending?: boolean }) {
  return <div className={`timeline-item ${pending ? "pending" : ""}`}><time>{time}</time><span>{icon}</span><div><strong>{title}</strong><p>{copy}</p></div></div>;
}

function ResponseStep({ done, active, label, meta }: { done?: boolean; active?: boolean; label: string; meta: string }) {
  return <div className={`response-step ${done ? "done" : ""} ${active ? "active" : ""}`}><span>{done ? <Check size={14} /> : active ? <CircleDot size={13} /> : null}</span><div><strong>{label}</strong><small>{meta}</small></div></div>;
}
