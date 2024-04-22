import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    YOUTUBE_API_KEY: z.string(),
    REDIS_HOST: z.string(),
    REDIS_PORT: z.string().transform(Number),
    REDIS_PASSWORD: z.string(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  },
});
