"use client";

import { useEffect, useState } from "react";
import styles from "./MetaPixel.module.css";

const META_PIXEL_ID = "1347647340858998";
const CONSENT_KEY = "cra24_meta_tracking_consent_v1";
export const LEAD_MARKER_KEY = "cra24_beta_form_submitted";
export const META_MARKETING_PATHS = new Set(["/", "/richiedi-beta", "/grazie", "/privacy"]);

type Consent = "accepted" | "rejected";
type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __cra24MetaPixelInitialized?: boolean;
  }
}

function initializeMetaPixel() {
  if (window.__cra24MetaPixelInitialized) {
    window.fbq?.("consent", "grant");
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-cra24-meta-pixel="true"]');

    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args);
        else fbq.queue.push(args);
      } as Fbq;
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      window._fbq = fbq;
    }

    const finish = () => {
      if (!window.__cra24MetaPixelInitialized) {
        window.fbq?.("init", META_PIXEL_ID);
        window.fbq?.("consent", "grant");
        window.__cra24MetaPixelInitialized = true;
      }
      resolve();
    };

    if (existing) {
      if (window.__cra24MetaPixelInitialized) resolve();
      else existing.addEventListener("load", finish, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    script.dataset.cra24MetaPixel = "true";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Meta Pixel non disponibile")), { once: true });
    document.head.appendChild(script);
  });
}

function trackCurrentPage() {
  window.fbq?.("track", "PageView");

  if (window.location.pathname === "/richiedi-beta") {
    window.fbq?.("track", "ViewContent", {
      content_name: "CRA24 beta application",
      content_category: "B2B beta",
    });
  }

  if (window.location.pathname === "/grazie" && sessionStorage.getItem(LEAD_MARKER_KEY) === "1") {
    window.fbq?.("track", "Lead", {
      content_name: "CRA24 beta application",
      content_category: "B2B beta",
    });
    sessionStorage.removeItem(LEAD_MARKER_KEY);
  }
}

export function MetaPixel() {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [ready, setReady] = useState(false);
  const [showChoice, setShowChoice] = useState(false);

  useEffect(() => {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    if (!META_MARKETING_PATHS.has(path)) return;
    const timer = window.setTimeout(() => {
      const stored = localStorage.getItem(CONSENT_KEY);
      const initial = stored === "accepted" || stored === "rejected" ? stored : null;
      setConsent(initial);
      setShowChoice(initial === null);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || consent !== "accepted") return;
    let cancelled = false;
    void initializeMetaPixel().then(() => {
      if (!cancelled) trackCurrentPage();
    }).catch(() => {
      // Tracking is optional: a blocked third-party script must never affect the site.
    });
    return () => { cancelled = true; };
  }, [consent, ready]);

  function choose(next: Consent) {
    localStorage.setItem(CONSENT_KEY, next);
    setConsent(next);
    setShowChoice(false);
    if (next === "rejected") window.fbq?.("consent", "revoke");
  }

  if (!ready) return null;

  return (
    <>
      {showChoice && (
        <section className={styles.banner} role="dialog" aria-modal="false" aria-labelledby="tracking-title">
          <div className={styles.copy}>
            <strong id="tracking-title">Misurazione facoltativa della campagna</strong>
            <p>
              Con il tuo consenso usiamo il Pixel Meta per misurare visite e candidature. Non inviamo a Meta i dati inseriti nel modulo. Puoi rifiutare o cambiare scelta in qualsiasi momento. <a href="/privacy">Leggi l’informativa</a>.
            </p>
          </div>
          <div className={styles.actions}>
            <button className={styles.choice} type="button" onClick={() => choose("rejected")}>Rifiuta</button>
            <button className={styles.choice} type="button" onClick={() => choose("accepted")}>Accetta</button>
          </div>
        </section>
      )}
      {!showChoice && (
        <button className={styles.preferences} type="button" onClick={() => setShowChoice(true)}>
          Privacy e cookie
        </button>
      )}
    </>
  );
}
