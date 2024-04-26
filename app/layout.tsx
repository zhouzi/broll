import { Analytics } from "@vercel/analytics/react";
import { Outfit as FontSans } from "next/font/google";
import { AxiomWebVitals } from "next-axiom";

import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "broll.gabin.app",
  description:
    "Éditeur de vignette personnalisée YouTube pour incrustation en b-roll, illustration réseaux sociaux, et autres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <AxiomWebVitals />
      </head>
      <body
        className={cn(
          "min-h-screen bg-muted/40 font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
