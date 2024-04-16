import fs from "node:fs/promises";
import path from "node:path";

import { youtube } from "@googleapis/youtube";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import "dayjs/locale/fr";

dayjs.locale("fr");
dayjs.extend(duration);
dayjs.extend(relativeTime);

export const dynamic = "force-dynamic";

async function fetchVideoDetails(videoId: string) {
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

  const title = video.snippet?.title ?? "Untitled";

  const thumbnail =
    video.snippet?.thumbnails?.maxres?.url ??
    "https://i3.ytimg.com/vi/XEO3duW1A80/maxresdefault.jpg";

  const formatter = new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    compactDisplay: "short",
  });
  const views = formatter.format(
    video.statistics?.viewCount ? Number(video.statistics?.viewCount) : 0
  );

  const duration = dayjs
    .duration(video.contentDetails?.duration ?? "PT0S")
    .format("mm:ss");

  const publishedAt = dayjs(
    video.snippet?.publishedAt
      ? new Date(video.snippet?.publishedAt)
      : new Date()
  ).fromNow();

  return {
    title,
    thumbnail,
    duration,
    views,
    publishedAt,
  };
}

export async function GET(request: NextRequest) {
  const parameters = Object.fromEntries(request.nextUrl.searchParams);
  const videoId = new URL(
    parameters.videoUrl ?? "https://www.youtube.com/watch?v=XEO3duW1A80"
  ).searchParams.get("v");

  if (videoId == null) {
    return new Response("L'URL de la vidéo YouTube est invalide", {
      status: 400,
    });
  }

  const fontsDirectory = path.join(process.cwd(), "fonts");
  const robotoRegular = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Regular.ttf")
  );
  const robotoMedium = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Medium.ttf")
  );

  const width = 450;

  const videoDetails = await fetchVideoDetails(videoId);

  const parameterProgress = Number(parameters.progress);
  const progress = isNaN(Number(parameters.progress))
    ? "100%"
    : `${Math.max(0, Math.min(100, Number(parameters.progress)))}%`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img src={videoDetails.thumbnail} alt="" />
          {!parameters.noDuration && (
            <div
              style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                backgroundColor: "#2a2a2a",
                borderRadius: "6px",
                color: "white",
                fontSize: "12px",
                fontWeight: 500,
                padding: "4px",
              }}
            >
              {videoDetails.duration}
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              height: "4px",
              width: "100%",
              display: "flex",
              backgroundColor: "rgba(200, 200, 200, 0.6)",
            }}
          >
            <div style={{ width: progress, backgroundColor: "#ff0000" }} />
          </div>
        </div>
        <div
          style={{
            color: "#0f0f0f",
            fontWeight: 500,
            fontSize: "16px",
            marginBottom: "12px",
          }}
        >
          {videoDetails.title}
        </div>
        <div
          style={{
            display: "flex",
            gap: "4px",
            fontSize: "14px",
            color: "#606060",
          }}
        >
          {!parameters.noViews && <span>{videoDetails.views} vues</span>}
          <span>·</span>
          {!parameters.noPublishedAt && <span>{videoDetails.publishedAt}</span>}
        </div>
      </div>
    ),
    {
      width,
      // @ts-expect-error satori can autosize height but Next disallows it
      height: "auto",
      fonts: [
        {
          name: "Roboto",
          data: robotoRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Roboto",
          data: robotoMedium,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}
