import { Config } from "drizzle-kit";

import { env } from "./lib/env";

export default {
  schema: "./lib/db/schema.ts",
  driver: "pg",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
  verbose: true,
  strict: true,
} satisfies Config;
