import * as schema from "@/lib/schema";
import { getChannelById, getVideoById } from "@/lib/youtube-client";

async function fetchVideoDetails(videoId: string) {
  const video = await getVideoById(videoId);

  if (video?.snippet?.channelId == null) {
    return undefined;
  }

  const channel = await getChannelById(video.snippet.channelId);

  if (channel == null) {
    return undefined;
  }

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

  if (videoDetails == null) {
    return Response.json({ error: "Video not found" }, { status: 404 });
  }

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
