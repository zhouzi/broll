import { youtube, youtube_v3 } from "@googleapis/youtube";
import { Ratelimit } from "@upstash/ratelimit";

import { env } from "@/lib/env";

import { redis } from "./redis";

export const ratelimit = {
  abuse: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, "10 s"),
  }),
  free: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, "1 d"),
  }),
};

const client = youtube({
  auth: env.YOUTUBE_API_KEY,
  version: "v3",
});

const aWeekInSeconds = 604800;

const videoParts = ["snippet", "statistics", "contentDetails"];

export async function getVideoById({
  ip,
  videoId,
}: {
  ip: string;
  videoId: string;
}) {
  const videoKey = `video(${videoParts.join(",")}):${videoId}`;
  let video = (await redis.get<youtube_v3.Schema$Video>(videoKey)) ?? undefined;

  if (video) {
    return video;
  }

  const { success } = await ratelimit.free.limit(ip);
  if (!success) {
    return undefined;
  }

  try {
    const {
      data: { items: videos },
    } = await client.videos.list({
      id: [videoId],
      part: ["snippet", "statistics", "contentDetails"],
    });
    video = videos?.[0];
  } catch (err) {
    // TODO: better type this error based on youtube's client (seems to be an AxiosError)
    const errorMessage = (err as any).errors?.[0]?.message;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    throw new Error("Unknown error");
  }

  if (video) {
    await redis.set(videoKey, video, { ex: aWeekInSeconds });
    return video;
  }

  return undefined;
}

const channelParts = ["snippet"];

export async function getChannelById({
  ip,
  channelId,
}: {
  ip: string;
  channelId: string;
}) {
  const channelKey = `channel(${channelParts.join(",")}):${channelId}`;
  let channel =
    (await redis.get<youtube_v3.Schema$Channel>(channelKey)) ?? undefined;

  if (channel) {
    return channel;
  }

  const { success } = await ratelimit.free.limit(ip);
  if (!success) {
    return undefined;
  }

  try {
    const {
      data: { items: channels },
    } = await client.channels.list({
      id: [channelId],
      part: ["snippet"],
    });
    channel = channels?.[0];
  } catch (err) {
    // TODO: better type this error based on youtube's client (seems to be an AxiosError)
    const errorMessage = (err as any).errors?.[0]?.message;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    throw new Error("Unknown error");
  }

  if (channel) {
    await redis.set(channelKey, channel, { ex: aWeekInSeconds });
    return channel;
  }

  return undefined;
}
