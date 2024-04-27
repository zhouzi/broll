import { Outfit as FontSans } from "next/font/google";
import { AxiomWebVitals } from "next-axiom";
import PlausibleProvider from "next-plausible";

import { Toaster } from "@/components/ui/sonner";
import { getServerAuthSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { cn } from "@/lib/utils";

import { NextAuthProvider } from "./next-auth-provider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerAuthSession();
  return (
    <html lang="fr">
      <head>
        <AxiomWebVitals />
        <PlausibleProvider
          domain={new URL(env.NEXTAUTH_URL).hostname}
          customDomain={env.PLAUSIBLE_CUSTOM_DOMAIN}
          selfHosted={Boolean(env.PLAUSIBLE_CUSTOM_DOMAIN)}
          enabled={
            env.NODE_ENV === "production" ||
            Boolean(env.PLAUSIBLE_CUSTOM_DOMAIN)
          }
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-muted/40 font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextAuthProvider session={session}>
          {children}
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
