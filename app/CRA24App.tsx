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
  Download,
  FileCheck2,
  FileText,
  Gauge,
  Globe2,
  Inbox,
  LayoutDashboard,
  Link2,
  ListFilter,
  Menu,
  PackageCheck,
  Plus,
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
      "Aggiornamento firmware distribuito e validato su tutti i seriali interessati. Dossier di chiusura firmato.",
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
  { name: "MotionPLC Runtime", supplier: "Motronix", version: "11.2.5", products: 5, serials: 486, health: "Protetto" },
  { name: "SafeMotion Library", supplier: "Internal", version: "3.7.1", products: 6, serials: 812, health: "Protetto" },
];

const reportRows = [
  { title: "Early warning — CVE-2026-48312", type: "CRA 24h", date: "13 ago 2026", state: "Bozza", owner: "Laura Bianchi" },
  { title: "Impact assessment — HMI Connect", type: "Impatto", date: "13 ago 2026", state: "In revisione", owner: "Marco Riva" },
  { title: "Dossier chiusura — CVE-2026-39211", type: "Finale", date: "02 ago 2026", state: "Firmato", owner: "Paolo Neri" },
  { title: "Registro incidenti — Q2 2026", type: "Registro", date: "30 giu 2026", state: "Firmato", owner: "Elena Conti" },
];

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Panoramica", icon: LayoutDashboard },
  { id: "incidents", label: "Incidenti", icon: AlertTriangle },
  { id: "assets", label: "Parco installato", icon: Box },
  { id: "components", label: "Componenti", icon: ServerCog },
  { id: "reports", label: "Dossier & report", icon: FileCheck2 },
];

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
}: {
  currentUser: { displayName: string; email: string };
  signOutPath: string;
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
  const importRef = useRef<HTMLInputElement>(null);
  const currentUserInitials = initialsFor(currentUser.displayName);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedIncidents = localStorage.getItem("cra24-incidents");
      const savedAssets = localStorage.getItem("cra24-assets");
      if (savedIncidents) setIncidents(JSON.parse(savedIncidents));
      if (savedAssets) setAssets(JSON.parse(savedAssets));
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

  function updateIncidentStatus(status: Incident["status"], progress: number) {
    setIncidents((current) =>
      current.map((incident) => (incident.id === activeIncident.id ? { ...incident, status, progress } : incident)),
    );
    notify(status === "Chiuso" ? "Incidente chiuso e dossier aggiornato" : "Stato dell'incidente aggiornato");
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
      regulatoryWorkflow: "CRA Article 14 readiness",
      incident: activeIncident,
      affectedAssets: assets.filter((asset) => asset.status !== "Non esposto"),
      evidenceStatus: "Human review required before submission",
    };
    downloadFile(`CRA24-${activeIncident.cve}-dossier.json`, JSON.stringify(payload, null, 2));
    notify("Dossier esportato. Revisione umana richiesta prima dell'invio.");
  }

  function exportAssets() {
    const rows = [
      ["Seriale", "Modello", "Cliente", "Sito", "Release", "Esposizione", "Stato"],
      ...filteredAssets.map((asset) => [asset.id, asset.model, asset.customer, asset.site, asset.release, asset.exposure, asset.status]),
    ];
    downloadFile("CRA24-parco-installato.csv", rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n"), "text/csv");
    notify("Parco installato esportato in CSV");
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
      notify(`${imported.length} seriali importati e messi in verifica`);
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
    notify("Incident room creata. Il timer CRA è stato avviato.");
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
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><ShieldCheck size={19} strokeWidth={2.25} /></div>
          <div><strong>CRA<span>24</span></strong><small>Product Security Ops</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Chiudi menu"><X size={18} /></button>
        </div>

        <button className="workspace-switcher">
          <span className="workspace-avatar">AP</span>
          <span><small>Workspace</small><strong>Aster Packaging</strong></span>
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
          <div className="deadline-top"><span><Clock3 size={15} /> CRA reporting</span><em>29 giorni</em></div>
          <div className="deadline-track"><span /></div>
          <p>Il workflow di segnalazione entra in funzione l&apos;11 settembre 2026.</p>
          <button onClick={() => navigate("reports")}>Verifica preparazione <ArrowRight size={14} /></button>
        </div>

        <div className="sidebar-user">
          <span className="user-avatar">{currentUserInitials}</span>
          <span><strong>{currentUser.displayName}</strong><small>Utente autenticato</small></span>
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
            <span className="sync-state"><span /> Dati sincronizzati</span>
            <button className="icon-button" aria-label="Notifiche"><Bell size={18} /><i /></button>
            <button className="top-avatar" onClick={() => setProfileOpen((open) => !open)} aria-label="Apri profilo">{currentUserInitials}</button>
          </div>
          {profileOpen && (
            <div className="profile-popover">
              <div className="profile-identity"><span>{currentUserInitials}</span><div><strong>{currentUser.displayName}</strong><small>{currentUser.email}</small></div></div>
              <em><CheckCircle2 size={13} /> Accesso verificato con ChatGPT</em>
              <button onClick={() => { navigate("settings"); setProfileOpen(false); }}>Impostazioni workspace</button>
              <a href={signOutPath}>Esci dall&apos;account</a>
            </div>
          )}
        </header>

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
          {view === "reports" && <ReportsView exportIncident={exportIncident} notify={notify} />}
          {view === "integrations" && <IntegrationsView notify={notify} />}
          {view === "settings" && <SettingsView notify={notify} />}
        </div>
      </main>

      <input ref={importRef} className="hidden-input" type="file" accept=".csv,text/csv" onChange={(event) => importCsv(event.target.files?.[0])} />

      {newIncidentOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-card" onSubmit={addIncident}>
            <div className="modal-head"><div><span className="eyebrow">Nuova segnalazione</span><h2>Apri un&apos;incident room</h2></div><button type="button" onClick={() => setNewIncidentOpen(false)} aria-label="Chiudi"><X size={19} /></button></div>
            <p className="modal-intro">Inserisci le informazioni già disponibili. CRA24 avvierà il triage e conserverà ogni modifica nel registro.</p>
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

      {toast && <div className="toast"><CheckCircle2 size={18} /><span>{toast}</span></div>}
    </div>
  );
}

function Overview({ incident, tab, setTab, assets, selectedAssets, setAssets, patchSelected, exportIncident, updateIncidentStatus, openIncidents, openAssets, newIncident, notify }: {
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
        <article className="metric-card"><div className="metric-icon ink"><Box size={18} /></div><div><span>Seriali monitorati</span><strong>2.418</strong><small>6 famiglie di prodotto</small></div></article>
        <article className="metric-card"><div className="metric-icon amber"><Activity size={18} /></div><div><span>Seriali a rischio</span><strong>127</strong><small>31 clienti potenzialmente coinvolti</small></div></article>
        <article className="metric-card readiness"><div className="metric-icon green"><Gauge size={18} /></div><div><span>CRA readiness</span><strong>82%</strong><small>4 controlli ancora da completare</small></div><div className="metric-ring" style={{ "--value": "82%" } as React.CSSProperties}><span>82</span></div></article>
      </section>

      <section className="incident-hero">
        <div className="incident-summary">
          <div className="incident-kicker"><span className="live-pulse" /> INCIDENTE PRIORITARIO <span>Rilevato {incident.detected.toLowerCase()}</span></div>
          <div className="incident-title-row"><div><div className="incident-id-row"><code>{incident.cve}</code><span className={`severity ${incident.severity.toLowerCase()}`}>{incident.severity}</span><span className={`status ${statusClass(incident.status)}`}>{incident.status}</span></div><h2>{incident.title}</h2><p>{incident.summary}</p></div><button className="round-action" onClick={openIncidents} aria-label="Apri tutti gli incidenti"><ArrowRight size={19} /></button></div>
          <div className="incident-meta"><span><ServerCog size={15} /><b>{incident.component}</b> {incident.version}</span><span><Users size={15} />Owner: <b>{incident.owner}</b></span></div>
        </div>
        <div className="deadline-panel">
          <div className="deadline-heading"><Clock3 size={17} /><span>CRA Article 14</span><em>Timer attivo</em></div>
          <div className="countdown"><div><small>EARLY WARNING · 24H</small><strong>05<span>h</span> 42<span>m</span></strong><p>Scade oggi alle 14:42</p></div><div><small>NOTIFICA COMPLETA · 72H</small><strong>53<span>h</span> 42<span>m</span></strong><p>Scade sabato alle 14:42</p></div></div>
          <div className="deadline-actions"><button onClick={() => notify("Bozza early warning aperta per la revisione")}><FileText size={15} /> Apri bozza 24h</button><button onClick={() => notify("Responsabile notificato")}>Avvisa owner</button></div>
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
              <div className="impact-map">
                <div className="map-node source"><span><AlertTriangle size={17} /></span><div><small>VULNERABILITÀ</small><strong>{incident.cve}</strong><em>CVSS 9.8 · Exploit osservato</em></div></div>
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
                <h3>Condizioni verificate</h3>
                <div><CheckCircle2 size={17} /><span><b>Componente presente</b><small>Fingerprint corrispondente su 127 seriali</small></span></div>
                <div><CheckCircle2 size={17} /><span><b>Vettore raggiungibile</b><small>89 gateway espongono il servizio remoto</small></span></div>
                <div className="pending"><CircleDot size={17} /><span><b>Exploitability review</b><small>Revisione umana in corso · Laura Bianchi</small></span></div>
                <div className="muted"><Clock3 size={17} /><span><b>Conferma del fornitore</b><small>Richiesta inviata 24 minuti fa</small></span></div>
              </div>
            </div>
          )}

          {tab === "assets" && (
            <div className="asset-mini-table">
              <div className="bulk-bar"><span>{selectedAssets.length ? `${selectedAssets.length} selezionati` : `${affected.length} seriali da gestire`}</span><button onClick={patchSelected}><PackageCheck size={15} /> Pianifica patch</button><button onClick={openAssets}>Apri registro completo</button></div>
              <div className="table-scroll"><table><thead><tr><th><input type="checkbox" aria-label="Seleziona tutti" checked={selectedAssets.length === affected.length && affected.length > 0} onChange={(event) => setAssets((current) => current.map((asset) => ({ ...asset, selected: asset.status !== "Non esposto" ? event.target.checked : false })))} /></th><th>Seriale</th><th>Cliente / sito</th><th>Release</th><th>Esposizione</th><th>Stato</th></tr></thead><tbody>{assets.slice(0, 6).map((asset) => <AssetRow key={asset.id} asset={asset} toggle={() => setAssets((current) => current.map((row) => row.id === asset.id ? { ...row, selected: !row.selected } : row))} />)}</tbody></table></div>
            </div>
          )}

          {tab === "timeline" && (
            <div className="timeline-list">
              <TimelineItem time="08:42" title="Vulnerabilità acquisita" copy="Advisory VisuTech verificato e collegato al componente HMI Connect Pro." icon={<Inbox size={16} />} />
              <TimelineItem time="08:47" title="Impact graph completato" copy="127 seriali e 31 clienti identificati sulle release 5.10–5.12." icon={<Link2 size={16} />} />
              <TimelineItem time="09:06" title="Triage assegnato" copy="Laura Bianchi ha preso in carico la valutazione di exploitability." icon={<Users size={16} />} />
              <TimelineItem time="09:28" title="Fornitore contattato" copy="Richiesta patch e conferma tecnica inviata a VisuTech." icon={<Bell size={16} />} pending />
            </div>
          )}
        </article>

        <aside className="panel response-panel">
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
            {incident.status === "Chiuso" && <button className="button secondary wide" onClick={exportIncident}><Download size={16} /> Scarica dossier firmato</button>}
            <small>Ogni azione viene registrata nell&apos;audit log.</small>
          </div>
        </aside>
      </section>

      <section className="bottom-grid">
        <article className="panel recent-panel"><div className="section-title"><div><h3>Incidenti recenti</h3><p>Attività sulle altre linee di prodotto</p></div><button onClick={openIncidents}>Vedi tutti <ArrowRight size={15} /></button></div><div className="recent-row"><span className="severity-dot high" /><div><strong>CVE-2026-47105</strong><small>RemoteLink Gateway · FlexPack X5</small></div><span>48 seriali</span><em className="status triage">Triage</em><ChevronRight size={16} /></div><div className="recent-row"><span className="severity-dot medium" /><div><strong>CVE-2026-44987</strong><small>EdgeCore IPC · 4 modelli</small></div><span>214 seriali</span><em className="status monitoraggio">Monitoraggio</em><ChevronRight size={16} /></div></article>
        <article className="panel coverage-panel"><div className="section-title"><div><h3>Copertura dati</h3><p>Qualità del grafo installato</p></div><button onClick={openAssets}>Dettagli</button></div><div className="coverage-main"><div className="coverage-ring"><strong>94%</strong><span>completo</span></div><div><p><span className="dot green" />Seriali con release nota <b>2.276</b></p><p><span className="dot amber" />Da classificare <b>98</b></p><p><span className="dot gray" />Dati insufficienti <b>44</b></p></div></div></article>
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
    <section className="page-heading"><div><span className="eyebrow">Installed base</span><h1>Parco installato</h1><p>Ogni configurazione, release e cliente collegati alle vulnerabilità rilevanti.</p></div><div className="heading-actions"><button className="button secondary" onClick={exportAssets}><Download size={16} /> Esporta CSV</button><button className="button primary" onClick={importCsv}><Upload size={16} /> Importa seriali</button></div></section>
    <section className="asset-summary"><div><strong>2.418</strong><span>Seriali totali</span></div><div><strong>2.276</strong><span>Release verificata</span></div><div><strong>98</strong><span>Da classificare</span></div><div><strong>14</strong><span>Paesi coperti</span></div></section>
    <section className="panel registry-panel"><div className="registry-toolbar"><div><h3>Registro macchine</h3><span>{visible.length} risultati visualizzati</span></div><select value={status} onChange={(event) => setStatus(event.target.value)}><option>Tutti gli stati</option><option>Da verificare</option><option>Patch pianificata</option><option>Mitigato</option><option>Non esposto</option></select></div><div className="table-scroll"><table className="registry-table"><thead><tr><th><input type="checkbox" aria-label="Seleziona tutti" /></th><th>Seriale / modello</th><th>Cliente / sito</th><th>Release</th><th>Esposizione</th><th>Stato</th><th /></tr></thead><tbody>{visible.map((asset) => <AssetRow key={asset.id} asset={asset} toggle={() => setAssets((current) => current.map((row) => row.id === asset.id ? { ...row, selected: !row.selected } : row))} />)}</tbody></table></div></section>
  </>;
}

function AssetRow({ asset, toggle }: { asset: Asset; toggle: () => void }) {
  return <tr><td><input type="checkbox" checked={Boolean(asset.selected)} onChange={toggle} aria-label={`Seleziona ${asset.id}`} /></td><td><strong>{asset.id}</strong><small>{asset.model}</small></td><td><strong>{asset.customer}</strong><small>{asset.site}</small></td><td><code>{asset.release}</code></td><td><span className={`exposure ${asset.exposure === "Remota" ? "remote" : ""}`}>{asset.exposure}</span></td><td><em className={`asset-status ${statusClass(asset.status)}`}>{asset.status}</em></td><td><button className="row-action" aria-label={`Apri ${asset.id}`}><ChevronRight size={16} /></button></td></tr>;
}

function ComponentsView({ query, notify }: { query: string; notify: (message: string) => void }) {
  const visible = components.filter((item) => [item.name, item.supplier, item.version].join(" ").toLowerCase().includes(query));
  return <><section className="page-heading"><div><span className="eyebrow">Software supply chain</span><h1>Componenti software</h1><p>Dipendenze, fornitori e versioni collegate ai prodotti commercializzati.</p></div><button className="button primary" onClick={() => notify("Importazione SBOM pronta: seleziona un file CycloneDX o SPDX")}><Upload size={16} /> Importa SBOM</button></section><section className="component-grid">{visible.map((item) => <article className="component-card" key={item.name}><div className="component-top"><span><ServerCog size={19} /></span><em className={`component-health ${statusClass(item.health)}`}>{item.health}</em></div><h3>{item.name}</h3><p>{item.supplier} · <code>{item.version}</code></p><div className="component-stats"><span><small>PRODOTTI</small><strong>{item.products}</strong></span><span><small>SERIALI</small><strong>{item.serials}</strong></span></div><button onClick={() => notify(`Grafo di ${item.name} aperto`)}>Apri impact graph <ArrowRight size={15} /></button></article>)}</section></>;
}

function ReportsView({ exportIncident, notify }: { exportIncident: () => void; notify: (message: string) => void }) {
  return <><section className="page-heading"><div><span className="eyebrow">Evidence vault</span><h1>Dossier & report</h1><p>Documenti tracciati, revisionati e pronti per il controllo umano.</p></div><button className="button primary" onClick={exportIncident}><FileCheck2 size={16} /> Genera dossier</button></section><section className="report-callout"><div className="report-callout-icon"><ShieldEllipsis size={25} /></div><div><span>Preparazione CRA</span><h2>Il processo di segnalazione è configurato all&apos;82%</h2><p>Completa il referente sostitutivo e verifica il canale di escalation prima dell&apos;11 settembre.</p></div><button onClick={() => notify("Checklist di preparazione aperta")}>Completa checklist <ArrowRight size={16} /></button></section><section className="panel reports-table"><div className="section-title"><div><h3>Documenti recenti</h3><p>Bozze, assessment e dossier finali</p></div><button><ListFilter size={15} /> Filtra</button></div>{reportRows.map((report) => <div className="report-row" key={report.title}><span className="report-icon"><FileText size={18} /></span><div><strong>{report.title}</strong><small>{report.type} · {report.date}</small></div><span>{report.owner}</span><em className={`report-state ${statusClass(report.state)}`}>{report.state}</em><button onClick={() => notify(`${report.title} scaricato`)} aria-label={`Scarica ${report.title}`}><Download size={16} /></button></div>)}</section></>;
}

function IntegrationsView({ notify }: { notify: (message: string) => void }) {
  const items = [
    { icon: <Box size={20} />, name: "ERP / PLM", copy: "Seriali, distinte e configurazioni prodotto", state: "Connesso", detail: "Ultimo sync 8 min fa" },
    { icon: <ServerCog size={20} />, name: "SBOM Pipeline", copy: "CycloneDX, SPDX e scanner esistenti", state: "Connesso", detail: "12 sorgenti attive" },
    { icon: <Users size={20} />, name: "CRM & Service", copy: "Clienti, siti installati e referenti", state: "Connesso", detail: "2.418 asset collegati" },
    { icon: <Globe2 size={20} />, name: "CRA Single Reporting Platform", copy: "Preparazione pacchetto per invio autorizzato", state: "Da configurare", detail: "Richiede referente CRA" },
  ];
  return <><section className="page-heading"><div><span className="eyebrow">Data fabric</span><h1>Integrazioni</h1><p>Collega le fonti che alimentano l&apos;impact graph senza sostituire i sistemi esistenti.</p></div></section><section className="integration-list">{items.map((item) => <article className="integration-card" key={item.name}><span className="integration-icon">{item.icon}</span><div><h3>{item.name}</h3><p>{item.copy}</p><small>{item.detail}</small></div><em className={item.state === "Connesso" ? "connected" : "configure"}><span />{item.state}</em><button className="button secondary compact" onClick={() => notify(`${item.name}: configurazione aperta`)}>{item.state === "Connesso" ? "Gestisci" : "Configura"}</button></article>)}</section></>;
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
