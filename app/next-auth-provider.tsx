"use client";
import { SessionProvider, SessionProviderProps } from "next-auth/react";

export function NextAuthProvider(props: SessionProviderProps) {
  return <SessionProvider {...props} />;
}
