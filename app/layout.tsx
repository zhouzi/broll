import { Inter as FontSans } from "next/font/google";

import { cn } from "@/lib/utils";

import type { Metadata } from "next";

import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "custom-youtube-thumbnail",
  description:
    "Proposition de Gabin, d'après une idée de BastiUI et un challenge de BenjaminCode.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={cn(
          "min-h-screen bg-muted/40 font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
