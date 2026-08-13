import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://cra24-product-security.andreagadducci.chatgpt.site"),
  title: "CRA24 — Product Security Operations",
  description:
    "Individua i prodotti e i clienti coinvolti da una vulnerabilità, coordina la risposta e conserva ogni evidenza.",
  openGraph: {
    title: "CRA24 — Product Security Operations",
    description: "Dalla vulnerabilità ai seriali coinvolti.",
    type: "website",
    locale: "it_IT",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "CRA24 Product Security Operations" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CRA24 — Product Security Operations",
    description: "Dalla vulnerabilità ai seriali coinvolti.",
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
      </body>
    </html>
  );
}
