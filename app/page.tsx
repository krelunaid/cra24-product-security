import type { Metadata } from "next";
import { CRA24App } from "./CRA24App";
import { chatGPTSignOutPath, getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRA24 — Product Security Operations",
  description:
    "Dalla vulnerabilità ai prodotti, seriali e clienti coinvolti. Gestisci l'intero ciclo di risposta CRA in un unico spazio operativo.",
};

export default async function Home() {
  const user = await getChatGPTUser();

  return (
    <CRA24App
      currentUser={{
        displayName: user?.displayName ?? "Visitatore demo",
        email: user?.email ?? "Nessun account richiesto",
      }}
      signOutPath={user ? chatGPTSignOutPath("/") : undefined}
      isAuthenticated={Boolean(user)}
    />
  );
}
