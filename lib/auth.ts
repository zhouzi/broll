import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/lib/env";

import { db } from "./db";

import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
