/* eslint-disable @next/next/no-img-element */
import fs from "node:fs/promises";
import path from "node:path";

import { youtube } from "@googleapis/youtube";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import * as queryString from "@/lib/query-string";
import * as schema from "@/lib/schema";

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

  return schema.videoDetails.parse({
    title: video.snippet?.title,
    thumbnail: video.snippet?.thumbnails?.maxres?.url,
    duration: video.contentDetails?.duration,
    views: video.statistics?.viewCount,
    publishedAt: video.snippet?.publishedAt,
  });
}

function createScale(message: schema.Message, baseScale: number) {
  function n(value: number) {
    return value * baseScale;
  }

  function px(value: number) {
    return `${n(value)}px`;
  }

  function fontSize(scale: number) {
    return `${n(16 * scale) * message.theme.card.fontSize}px`;
  }

  function spacing(scale: number) {
    return `${n(4 * scale) * message.theme.card.spacing}px`;
  }

  function borderRadius(scale: number) {
    return `${n(6 * scale) * message.theme.card.borderRadius}px`;
  }

  return { n, px, fontSize, spacing, borderRadius };
}

export async function GET(request: NextRequest) {
  const message = schema.message.parse(
    queryString.parse(request.nextUrl.search)
  );

  const videoId = schema.getVideoId(message.videoUrl);

  if (videoId == null) {
    return new Response("L'URL de la vidéo YouTube est invalide", {
      status: 400,
    });
  }

  const videoDetails = await fetchVideoDetails(videoId);

  const fontsDirectory = path.join(process.cwd(), "fonts");
  const robotoRegular = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Regular.ttf")
  );
  const robotoMedium = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Medium.ttf")
  );

  const { n, px, fontSize, spacing, borderRadius } = createScale(
    message,
    // FIXME: make it customizeable
    3
  );

  const width = n(450);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: message.theme.card.background,
          padding: spacing(7.5),
          borderRadius: borderRadius(6),
        }}
      >
        <div
          style={{
            display: "flex",
            marginBottom: spacing(5),
            borderRadius: borderRadius(2),
            overflow: "hidden",
            position: "relative",
          }}
        >
          <img src={videoDetails.thumbnail} alt="" />
          {message.theme.options.showDuration && (
            <div
              style={{
                position: "absolute",
                bottom: px(4),
                right: px(4),
                color: message.theme.duration.foreground,
                backgroundColor: message.theme.duration.background,
                borderRadius: borderRadius(1),
                fontSize: fontSize(0.75),
                fontWeight: 500,
                padding: spacing(1),
              }}
            >
              {videoDetails.duration}
            </div>
          )}
          {typeof message.theme.options.progressBar === "number" && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                height: px(4),
                width: "100%",
                display: "flex",
                backgroundColor: message.theme.progressBar.background,
              }}
            >
              <div
                style={{
                  width: `${message.theme.options.progressBar}%`,
                  backgroundColor: message.theme.progressBar.foreground,
                }}
              />
            </div>
          )}
        </div>
        <div
          style={{
            color: message.theme.card.foreground,
            fontWeight: 500,
            fontSize: fontSize(1),
            marginBottom: spacing(3),
          }}
        >
          {videoDetails.title}
        </div>
        {(message.theme.options.showViews ||
          message.theme.options.showPublishedAt) && (
          <div
            style={{
              display: "flex",
              gap: spacing(1),
              fontSize: fontSize(0.875),
              color: message.theme.card.foregroundMuted,
            }}
          >
            {message.theme.options.showViews && (
              <span>{videoDetails.views} vues</span>
            )}
            {message.theme.options.showViews &&
              message.theme.options.showPublishedAt && <span>·</span>}
            {message.theme.options.showPublishedAt && (
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
