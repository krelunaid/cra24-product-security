import type { Metadata } from "next";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { ensureDemoSchema, getDemoAccess, getDemoDatabase } from "../../db/demo";
import { CRA24App } from "../CRA24App";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
import styles from "../marketing.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Demo guidata — CRA24" },
  description:
    "Esplora uno scenario sintetico e scopri come CRA24 collega vulnerabilità, componenti, macchine ed evidenze.",
};

export default async function DemoPage() {
  const user = await requireChatGPTUser("/demo");
  const database = getDemoDatabase();
  await ensureDemoSchema(database);
  const access = await getDemoAccess(database, user.email, user.userId);

  if (!access) {
    return (
      <main className={styles.adminDenied}>
        <LockKeyhole size={25} />
        <h1>Accesso beta non abilitato.</h1>
        <p>L’indirizzo {user.email} non è ancora tra i tester approvati.</p>
        <a href="/accesso">Controlla l’accesso <ArrowRight size={14} /></a>
        <a href={chatGPTSignOutPath("/accesso")}>Usa un altro account</a>
      </main>
    );
  }

  return (
    <CRA24App
      currentUser={{
        displayName: user.displayName,
        email: user.email,
      }}
      company={access.company}
      signOutPath={chatGPTSignOutPath("/accesso")}
    />
  );
}
