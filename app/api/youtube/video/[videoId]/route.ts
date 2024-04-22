import { youtube } from "@googleapis/youtube";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "ioredis";
import { NextRequest } from "next/server";

import { env } from "@/lib/env";
import * as schema from "@/lib/schema";

async function fetchVideoDetails(videoId: string) {
  const client = youtube({
    auth: env.YOUTUBE_API_KEY,
    version: "v3",
  });

  const {
    data: { items: videos },
  } = await client.videos.list({
    id: [videoId],
    part: ["snippet", "statistics", "contentDetails"],
  });

  if (videos == null || videos.length === 0) {
    throw new Error("not found");
  }

  const [video] = videos;

  if (video.snippet?.channelId == null) {
    throw new Error("not found");
  }

  const {
    data: { items: channels },
  } = await client.channels.list({
    id: [video.snippet.channelId],
    part: ["snippet"],
  });

  if (channels == null) {
    throw new Error("not found");
  }

  const [channel] = channels;

  return schema.videoDetails.parse({
    title: video.snippet?.title,
    thumbnail:
      video.snippet?.thumbnails?.maxres?.url ??
      video.snippet?.thumbnails?.high?.url ??
      video.snippet?.thumbnails?.medium?.url ??
      video.snippet?.thumbnails?.default?.url,
    duration: video.contentDetails?.duration,
    views: video.statistics?.viewCount,
    publishedAt: video.snippet?.publishedAt,
    channel: {
      title: channel.snippet?.title,
      thumbnail:
        channel.snippet?.thumbnails?.high?.url ??
        channel.snippet?.thumbnails?.medium?.url ??
        channel.snippet?.thumbnails?.default?.url,
    },
  });
}

async function convertImageToBase64(href: string) {
  const response = await fetch(href);
  const buffer = await response.arrayBuffer();

  const base64String = Buffer.from(buffer).toString("base64");
  return `data:image/jpeg;base64,${base64String}`;
}

const client = new Redis(env.REDIS_PORT, env.REDIS_HOST, {
  password: env.REDIS_PASSWORD,
});

const ratelimit = new Ratelimit({
  redis: {
    sadd: <TData>(key: string, ...members: TData[]) =>
      client.sadd(key, ...members.map((m) => String(m))),
    hset: <TValue>(
      key: string,
      obj: {
        [key: string]: TValue;
      }
    ) => client.hset(key, obj),
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs
    ) =>
      client.eval(
        script,
        keys.length,
        ...keys,
        ...(args ?? []).map((a) => String(a))
      ) as Promise<TData>,
  },
  limiter: Ratelimit.slidingWindow(5, "10 s"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { videoId: string } }
) {
  const ip = request.ip ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);

  // eslint-disable-next-line no-console
  console.log({ reqIp: request.ip, ip });

  if (!success) {
    return new Response("rate limit exceeded", { status: 429 });
  }

  const videoDetails = await fetchVideoDetails(params.videoId);
  const [thumbnail, channelThumbnail] = await Promise.all([
    convertImageToBase64(videoDetails.thumbnail),
    convertImageToBase64(videoDetails.channel.thumbnail),
  ]);

  return Response.json({
    ...videoDetails,
    thumbnail,
    channel: {
      ...videoDetails.channel,
      thumbnail: channelThumbnail,
    },
  });
}
