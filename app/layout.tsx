import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost ?? requestHeaders.get("host") ?? "cra24.kreluna.it";
  const safeHost = /^[a-z0-9.-]+(?::\d+)?$/i.test(requestHost) ? requestHost : "cra24.kreluna.it";
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol === "http" || forwardedProtocol === "https"
    ? forwardedProtocol
    : safeHost.includes("localhost")
      ? "http"
      : "https";
  const metadataBase = new URL(`${protocol}://${safeHost}`);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: {
      default: "CRA24 — Product Security Operations, by Kreluna",
      template: "%s · CRA24",
    },
    description:
      "Dalla vulnerabilità alle macchine coinvolte: impatto, risposta ed evidenze in un unico spazio operativo.",
    openGraph: {
      title: "CRA24 — Product Security Operations",
      description: "Dalla vulnerabilità alle macchine coinvolte, prima che scadano le prime 24 ore.",
      type: "website",
      locale: "it_IT",
      siteName: "CRA24 by Kreluna",
      images: [{ url: socialImage, width: 1586, height: 992, alt: "CRA24 Product Security Operations, by Kreluna" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CRA24 — Product Security Operations",
      description: "Dalla vulnerabilità alle macchine coinvolte, prima che scadano le prime 24 ore.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
