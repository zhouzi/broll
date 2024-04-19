import { youtube } from "@googleapis/youtube";

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

export async function GET(
  req: Request,
  { params }: { params: { videoId: string } }
) {
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
