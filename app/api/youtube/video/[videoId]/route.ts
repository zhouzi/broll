import { type youtube_v3 } from "@googleapis/youtube";
import { type NextRequest } from "next/server";
import { withAxiom } from "next-axiom";

import { RateLimitError, ratelimit } from "@/lib/redis";
import * as schema from "@/lib/schema";
import { getChannelById, getVideoById } from "@/lib/youtube-client";

async function convertImageToBase64(href: string) {
  const response = await fetch(href);
  const buffer = await response.arrayBuffer();

  const base64String = Buffer.from(buffer).toString("base64");
  return `data:image/jpeg;base64,${base64String}`;
}

export const GET = withAxiom(async function GET(
  request: NextRequest,
  { params: { videoId } }: { params: { videoId: string } },
) {
  const ip =
    request.ip ?? request.headers.get("X-Forwarded-For") ?? "127.0.0.1";

  const { success, limit } = await ratelimit.abuse.limit(ip);
  if (!success) {
    return Response.json(
      {
        error: `Tu as dépassé la limite de ${limit} demandes sur 10 secondes, réessaie plus tard.`,
      },
      { status: 429 },
    );
  }

  let video: youtube_v3.Schema$Video | undefined = undefined;

  try {
    video = await getVideoById({ ip, videoId });
  } catch (err) {
    return err instanceof RateLimitError
      ? Response.json({ error: err.message }, { status: err.statusCode })
      : Response.json(
          {
            error:
              "Une erreur est survenue lors de la récupération des informations de la vidéo, réessaie plus ou envoi un email à gabin.aureche@gmail.com",
          },
          { status: 500 },
        );
  }

  if (video?.snippet?.channelId == null) {
    return Response.json(
      { error: "Cette vidéo est introuvable, vérifie l'URL." },
      { status: 404 },
    );
  }

  const channel = await getChannelById({
    ip,
    channelId: video.snippet.channelId,
  });

  if (channel == null) {
    return Response.json(
      { error: "La chaîne de cette vidéo est introuvable, vérifie l'URL." },
      { status: 404 },
    );
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
});
