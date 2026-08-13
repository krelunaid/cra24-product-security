import type { Metadata } from "next";
import { CRA24App } from "../CRA24App";
import { chatGPTSignOutPath, getChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Demo guidata — CRA24" },
  description:
    "Esplora uno scenario sintetico e scopri come CRA24 collega vulnerabilità, componenti, macchine ed evidenze.",
};

export default async function DemoPage() {
  const user = await getChatGPTUser();

  return (
    <CRA24App
      currentUser={{
        displayName: user?.displayName ?? "Visitatore demo",
        email: user?.email ?? "Nessun account richiesto",
      }}
      signOutPath={user ? chatGPTSignOutPath("/demo") : undefined}
      isAuthenticated={Boolean(user)}
    />
  );
}
