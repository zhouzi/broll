import { Analytics } from "@vercel/analytics/react";
import { Outfit as FontSans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { getServerAuthSession } from "@/lib/auth";
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
      <body
        className={cn(
          "min-h-screen bg-muted/40 font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextAuthProvider session={session}>
          {children}
          <Toaster />
          <Analytics />
        </NextAuthProvider>
      </body>
    </html>
  );
}
