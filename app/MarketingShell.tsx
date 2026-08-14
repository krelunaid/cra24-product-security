/* eslint-disable @next/next/no-html-link-for-pages -- Native anchors avoid a Vinext production prefetch failure. */
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./marketing.module.css";

export function CRA24Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a className={`${styles.brand} ${dark ? styles.brandDark : ""}`} href="/" aria-label="CRA24, homepage">
      <span className={styles.brandSymbol}>24</span>
      <span className={styles.brandText}>
        <strong>CRA<span>24</span></strong>
        <small>by Kreluna</small>
      </span>
    </a>
  );
}

export function MarketingShell({ children, lightHeader = false }: { children: ReactNode; lightHeader?: boolean }) {
  return (
    <div className={styles.marketingSite}>
      <header className={`${styles.siteHeader} ${lightHeader ? styles.siteHeaderLight : ""}`}>
        <div className={styles.headerInner}>
          <CRA24Brand dark={lightHeader} />
          <nav aria-label="Navigazione sito">
            <a href="/#prodotto">Prodotto</a>
            <a href="/#come-funziona">Come funziona</a>
            <a href="/#perche-cra24">Perché CRA24</a>
            <a href="/accesso">Demo</a>
            <a href="/accesso">Accesso</a>
          </nav>
          <a className={styles.headerCta} href="/richiedi-beta">Richiedi la beta <ArrowUpRight size={14} /></a>
        </div>
      </header>
      {children}
      <footer className={styles.siteFooter}>
        <div className={styles.footerTop}>
          <CRA24Brand />
          <p>Product Security Operations per costruttori di prodotti con elementi digitali.</p>
          <div className={styles.footerLinks}>
            <a href="/accesso">Demo</a>
            <a href="/richiedi-beta">Richiedi beta</a>
            <a href="/accesso">Accesso tester</a>
            <a href="/privacy">Privacy</a>
            <a href="mailto:cra24@kreluna.it">cra24@kreluna.it</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 CRA24</span>
          <a href="https://www.kreluna.it/" target="_blank" rel="noreferrer">A Kreluna product <ArrowUpRight size={12} /></a>
          <p>Beta operativa · non costituisce certificazione, consulenza legale o valutazione tecnica.</p>
        </div>
      </footer>
    </div>
  );
}
