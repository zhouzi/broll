import { NextRequest } from "next/server";

import * as schema from "@/lib/schema";
import { getChannelById, getVideoById, ratelimit } from "@/lib/youtube-client";

async function convertImageToBase64(href: string) {
  const response = await fetch(href);
  const buffer = await response.arrayBuffer();

  const base64String = Buffer.from(buffer).toString("base64");
  return `data:image/jpeg;base64,${base64String}`;
}

export async function GET(
  request: NextRequest,
  { params: { videoId } }: { params: { videoId: string } }
) {
  const ip =
    request.ip ?? request.headers.get("X-Forwarded-For") ?? "127.0.0.1";

  const { success } = await ratelimit.abuse.limit(ip);
  if (!success) {
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const video = await getVideoById({ ip, videoId });

  if (video?.snippet?.channelId == null) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

  const channel = await getChannelById({
    ip,
    channelId: video.snippet.channelId,
  });

  if (channel == null) {
    return Response.json({ error: "Channel not found" }, { status: 404 });
  }

  const videoDetails = schema.videoDetails.parse({
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
