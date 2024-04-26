import { Ratelimit } from "@upstash/ratelimit";
import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";

import { redis } from "./lib/redis";

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export const config = {
  matcher: "/api/youtube/video/:path*",
};

export default async function middleware(request: NextRequest) {
  if (env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  return success
    ? NextResponse.next()
    : NextResponse.json({ error: "rate limit exceeded" }, { status: 429 });
}
