import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./marketing.module.css";

export function CRA24Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link className={`${styles.brand} ${dark ? styles.brandDark : ""}`} href="/" aria-label="CRA24, homepage">
      <span className={styles.brandSymbol}>24</span>
      <span className={styles.brandText}>
        <strong>CRA<span>24</span></strong>
        <small>by Kreluna</small>
      </span>
    </Link>
  );
}

export function MarketingShell({ children, lightHeader = false }: { children: ReactNode; lightHeader?: boolean }) {
  return (
    <div className={styles.marketingSite}>
      <header className={`${styles.siteHeader} ${lightHeader ? styles.siteHeaderLight : ""}`}>
        <div className={styles.headerInner}>
          <CRA24Brand dark={lightHeader} />
          <nav aria-label="Navigazione sito">
            <Link href="/#prodotto">Prodotto</Link>
            <Link href="/#come-funziona">Come funziona</Link>
            <Link href="/#perche-cra24">Perché CRA24</Link>
            <Link href="/demo">Demo</Link>
          </nav>
          <Link className={styles.headerCta} href="/richiedi-beta">Richiedi la beta <ArrowUpRight size={14} /></Link>
        </div>
      </header>
      {children}
      <footer className={styles.siteFooter}>
        <div className={styles.footerTop}>
          <CRA24Brand />
          <p>Product Security Operations per costruttori di prodotti con elementi digitali.</p>
          <div className={styles.footerLinks}>
            <Link href="/demo">Demo</Link>
            <Link href="/richiedi-beta">Richiedi beta</Link>
            <Link href="/privacy">Privacy</Link>
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
