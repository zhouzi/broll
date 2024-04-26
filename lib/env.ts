import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    YOUTUBE_API_KEY: z.string(),

    REDIS_HOST: z.string(),
    REDIS_PORT_NUMBER: z.string().transform(Number),
    REDIS_PASSWORD: z.string(),

    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string().url(),

    POSTGRES_HOST: z.string(),
    POSTGRES_PORT: z.string().transform(Number),
    POSTGRES_DB: z.string(),
    POSTGRES_USER: z.string(),
    POSTGRES_PASSWORD: z.string(),

    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT: z.string().url(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,

    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,

    NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT:
      process.env.NEXT_PUBLIC_AXIOM_INGEST_ENDPOINT,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT_NUMBER: process.env.REDIS_PORT_NUMBER,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,

    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,

    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,

    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  },
});
