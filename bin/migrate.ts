import path from "node:path";

import { migrate } from "drizzle-orm/node-postgres/migrator";

import config from "@/drizzle.config";
import { db } from "@/lib/db";

(async () => {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), config.out) });
})();
