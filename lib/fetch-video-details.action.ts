"use server";
import { youtube } from "@googleapis/youtube";

import * as schema from "@/lib/schema";

export async function fetchVideoDetails(videoId: string) {
  const client = youtube({
    auth: process.env.GOOGLE_API_KEY,
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
