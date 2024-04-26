import { createClient } from "@vercel/kv";

import { env } from "@/lib/env";

export const redis = createClient({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});
