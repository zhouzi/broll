"use server";
import { youtube } from "@googleapis/youtube";

import * as schema from "@/lib/schema";

export async function fetchVideoDetails(videoId: string) {
  const client = youtube({
    auth: process.env.GOOGLE_API_KEY,
    version: "v3",
  });

  const {
    data: { items },
  } = await client.videos.list({
    id: [videoId],
    part: ["snippet", "statistics", "contentDetails"],
  });

  if (items == null || items.length === 0) {
    throw new Error("not found");
  }

  const [video] = items;

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
  });
}
