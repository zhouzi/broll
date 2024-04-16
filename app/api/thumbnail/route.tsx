/* eslint-disable @next/next/no-img-element */
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

function createFactor(factor: number) {
  // eslint no-unused-vars is complaining about the function overload
  /* eslint-disable no-unused-vars */
  function n(value: number): number;
  function n(value: number, suffix: string): string;
  function n(value: number, suffix?: unknown) {
    const factorized = value * factor;

    if (typeof suffix === "string") {
      return `${factorized}${suffix}`;
    }

    return factorized;
  }
  /* eslint-enable no-unused-vars */

  function px(value: number) {
    return n(value, "px");
  }

  return { n, px };
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

  const parameterSize = Number(parameters.size);
  const { n, px } = createFactor(
    Math.max(0, Math.min(6, isNaN(parameterSize) ? 3 : parameterSize))
  );

  const width = n(450);

  const videoDetails = await fetchVideoDetails(videoId);

  const parameterProgress = Number(parameters.progress);
  const progress = isNaN(parameterProgress)
    ? "100%"
    : `${Math.max(0, Math.min(100, parameterProgress))}%`;

  const [
    cardBackground = "#ffffff",
    textForegroundMuted = "#606060",
    textForeground = "#0f0f0f",
    durationBackground = "#2a2a2a",
    progressForeground = "#ff0000",
  ] = parameters.theme?.split(",") ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: cardBackground,
          padding: px(30),
          borderRadius: px(40),
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: px(20),
            borderRadius: px(12),
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img src={videoDetails.thumbnail} alt="" />
          {!parameters.noDuration && (
            <div
              style={{
                position: "absolute",
                bottom: px(4),
                right: px(4),
                backgroundColor: durationBackground,
                borderRadius: px(6),
                color: "#ffffff",
                fontSize: px(12),
                fontWeight: 500,
                padding: px(4),
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
              height: px(4),
              width: "100%",
              display: "flex",
              backgroundColor: "rgba(200, 200, 200, 0.6)",
            }}
          >
            <div
              style={{ width: progress, backgroundColor: progressForeground }}
            />
          </div>
        </div>
        <div
          style={{
            color: textForeground,
            fontWeight: 500,
            fontSize: px(16),
            marginBottom: px(12),
          }}
        >
          {videoDetails.title}
        </div>
        {(!parameters.noViews || !parameters.noPublishedAt) && (
          <div
            style={{
              display: "flex",
              gap: px(4),
              fontSize: px(14),
              color: textForegroundMuted,
            }}
          >
            {!parameters.noViews && <span>{videoDetails.views} vues</span>}
            {!parameters.noViews && !parameters.noPublishedAt && <span>·</span>}
            {!parameters.noPublishedAt && (
              <span>{videoDetails.publishedAt}</span>
            )}
          </div>
        )}
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
