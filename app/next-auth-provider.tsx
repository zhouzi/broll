"use client";
import { SessionProvider, type SessionProviderProps } from "next-auth/react";

export function NextAuthProvider(props: SessionProviderProps) {
  return <SessionProvider {...props} />;
}
