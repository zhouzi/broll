import { youtube, type youtube_v3 } from "@googleapis/youtube";

import { env } from "@/env";

import { getJson, setJson, ratelimit, RateLimitError } from "./redis";

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
  let video = (await getJson<youtube_v3.Schema$Video>(videoKey)) ?? undefined;

  if (video) {
    return video;
  }

  const { success, limit } = await ratelimit.free.limit(ip);
  if (!success) {
    throw new RateLimitError(
      `Tu as dépassé la limite de ${limit} demandes sur 24h, envoi un email à gabin.aureche@gmail.com pour un accès sans limite.`,
    );
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const errorMessage = (err as any).errors?.[0]?.message as
      | string
      | undefined;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    throw new Error("Unknown error");
  }

  if (video) {
    await setJson(videoKey, video, { ex: aWeekInSeconds });
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
    (await getJson<youtube_v3.Schema$Channel>(channelKey)) ?? undefined;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const errorMessage = (err as any).errors?.[0]?.message as
      | string
      | undefined;
    if (errorMessage) {
      throw new Error(errorMessage);
    }
    throw new Error("Unknown error");
  }

  if (channel) {
    await setJson(channelKey, channel, { ex: aWeekInSeconds });
    return channel;
  }

  return undefined;
}
