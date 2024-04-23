import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "@/drizzle.config";

import * as schema from "./schema";

const pool = new Pool(config.dbCredentials);

export const db = drizzle(pool, {
  schema,
});
