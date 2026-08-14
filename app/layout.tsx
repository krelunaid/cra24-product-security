import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MetaPixel } from "./MetaPixel";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://cra24.kreluna.it"),
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
      images: [{ url: "/og.png", width: 1586, height: 992, alt: "CRA24 Product Security Operations, by Kreluna" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "CRA24 — Product Security Operations",
      description: "Dalla vulnerabilità alle macchine coinvolte, prima che scadano le prime 24 ore.",
      images: ["/og.png"],
    },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
