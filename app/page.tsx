import type { Metadata } from "next";
import { CRA24App } from "./CRA24App";
import { chatGPTSignOutPath, requireChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRA24 — Product Security Operations",
  description:
    "Dalla vulnerabilità ai prodotti, seriali e clienti coinvolti. Gestisci l'intero ciclo di risposta CRA in un unico spazio operativo.",
};

export default async function Home() {
  const user = await requireChatGPTUser("/");

  return (
    <CRA24App
      currentUser={{
        displayName: user.displayName,
        email: user.email,
      }}
      signOutPath={chatGPTSignOutPath("/")}
    />
  );
}
