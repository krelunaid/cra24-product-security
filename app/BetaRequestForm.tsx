"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import styles from "./marketing.module.css";

export function BetaRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams(window.location.search);
    const payload = {
      fullName: form.get("fullName"),
      company: form.get("company"),
      email: form.get("email"),
      role: form.get("role"),
      productType: form.get("productType"),
      priority: form.get("priority"),
      website: form.get("website"),
      caseSummary: form.get("caseSummary"),
      privacyAccepted: form.get("privacyAccepted") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
      companyFax: form.get("companyFax"),
      startedAt: startedAt.current,
      locale: document.documentElement.lang || "it",
      utmSource: params.get("utm_source") ?? "",
      utmMedium: params.get("utm_medium") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    };

    try {
      const response = await fetch("/api/beta", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Invio non riuscito.");
      window.location.assign("/grazie");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Invio non riuscito.");
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.betaForm} onSubmit={submit}>
      <div className={styles.formHead}>
        <span>CANDIDATURA · 3 MINUTI</span>
        <h2>Descrivi il tuo caso</h2>
      </div>
      <div className={styles.fieldGrid}>
        <div className={styles.field}>
          <label htmlFor="fullName">Nome e cognome *</label>
          <input id="fullName" name="fullName" autoComplete="name" maxLength={120} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="company">Azienda *</label>
          <input id="company" name="company" autoComplete="organization" maxLength={160} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="email">Email professionale *</label>
          <input id="email" name="email" type="email" autoComplete="email" maxLength={180} required />
        </div>
        <div className={styles.field}>
          <label htmlFor="role">Ruolo *</label>
          <input id="role" name="role" placeholder="es. Product Security Manager" maxLength={140} required />
        </div>
        <div className={styles.fieldFull}>
          <label htmlFor="productType">Tipologia di macchina o prodotto *</label>
          <input id="productType" name="productType" placeholder="es. linea di confezionamento con HMI e teleassistenza" maxLength={180} required />
        </div>
        <div className={styles.fieldFull}>
          <label htmlFor="priority">Problema più urgente *</label>
          <select id="priority" name="priority" defaultValue="" required>
            <option value="" disabled>Seleziona un’opzione</option>
            <option>Documentazione tecnica</option>
            <option>Vulnerabilità</option>
            <option>SBOM e componenti</option>
            <option>Gestione fornitori</option>
            <option>Scadenze e notifiche</option>
            <option>Altro</option>
          </select>
        </div>
        <div className={styles.fieldFull}>
          <label htmlFor="website">Sito aziendale <span>(facoltativo)</span></label>
          <input id="website" name="website" type="url" inputMode="url" placeholder="https://" maxLength={240} />
        </div>
        <div className={styles.fieldFull}>
          <label htmlFor="caseSummary">Descrizione sintetica <span>(facoltativa)</span></label>
          <textarea id="caseSummary" name="caseSummary" maxLength={1800} placeholder="Quale informazione è più difficile ricostruire oggi? Non inserire dati riservati, password o dettagli tecnici sensibili." />
        </div>
        <div className={styles.hiddenField} aria-hidden="true">
          <label htmlFor="companyFax">Fax aziendale</label>
          <input id="companyFax" name="companyFax" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <div className={styles.consentGroup}>
        <label className={styles.consent}>
          <input name="privacyAccepted" type="checkbox" required />
          <span>Ho letto l’<a href="/privacy" target="_blank">informativa privacy</a> e chiedo di essere ricontattato via email per questa richiesta di accesso alla beta. *</span>
        </label>
        <label className={styles.consent}>
          <input name="marketingConsent" type="checkbox" />
          <span>Desidero ricevere via email da Kreluna aggiornamenti e inviti relativi a CRA24. Posso revocare il consenso in qualsiasi momento. <b>Facoltativo.</b></span>
        </label>
      </div>

      {error && <p className={styles.submitError} role="alert">{error}</p>}
      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? <LoaderCircle size={16} className={styles.spin} /> : <>Invia la richiesta <ArrowRight size={16} /></>}
      </button>
      <p className={styles.formFinePrint}>L’invio non garantisce l’ammissione alla beta. La richiesta viene esaminata manualmente.</p>
    </form>
  );
}
