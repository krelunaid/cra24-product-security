import type { Metadata } from "next";
import { CRA24App } from "./CRA24App";

export const metadata: Metadata = {
  title: "CRA24 — Product Security Operations",
  description:
    "Dalla vulnerabilità ai prodotti, seriali e clienti coinvolti. Gestisci l'intero ciclo di risposta CRA in un unico spazio operativo.",
};

export default function Home() {
  return <CRA24App />;
}
