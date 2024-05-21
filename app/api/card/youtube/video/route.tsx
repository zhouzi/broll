import fs from "node:fs/promises";
import path from "node:path";

import deepMerge from "deepmerge";
import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import queryString from "qs";
import * as queryTypes from "query-types";

import { fetchVideoDetails } from "@/app/api/youtube/video/[videoId]/route";
import { YouTubeVideoCard, createScale } from "@/components/youtube-video-card";
import * as schema from "@/lib/schema";

export async function GET(request: NextRequest) {
  const formValues = schema.formSchema.parse(
    deepMerge(
      schema.formSchema.parse({ theme: schema.lightTheme }),
      queryTypes.parseObject(
        queryString.parse(request.nextUrl.search.slice(1)),
      ),
    ),
  );

  const scale = createScale(formValues.theme, 6);

  const videoDetails = await fetchVideoDetails({
    ip: request.ip ?? request.headers.get("X-Forwarded-For") ?? "127.0.0.1",
    videoId: schema.getVideoId(formValues.videoUrl)!,
  });

  const fontsDirectory = path.join(process.cwd(), "public", "fonts");
  const robotoRegular = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Regular.ttf"),
  );
  const robotoMedium = await fs.readFile(
    path.join(fontsDirectory, "Roboto-Medium.ttf"),
  );

  return new ImageResponse(
    (
      <YouTubeVideoCard
        scale={scale}
        theme={formValues.theme}
        videoDetails={videoDetails}
      />
    ),
    {
      width: scale.width,
      // @ts-expect-error Next's ImageResponse doesn't like height auto but it works
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
    },
  );
}
