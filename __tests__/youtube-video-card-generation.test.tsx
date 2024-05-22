import fs from "node:fs/promises";
import path from "node:path";

import { toMatchImageSnapshot } from "jest-image-snapshot";
import satori from "satori";
import { expect, describe, beforeAll, it } from "vitest";

import { YouTubeVideoCard, createScale } from "@/components/youtube-video-card";
import * as schema from "@/lib/schema";

expect.extend({ toMatchImageSnapshot });

describe("YouTube video card image generation", () => {
  let generateImage = async (_args: {
    theme: schema.Theme;
    videoDetails: schema.VideoDetails;
  }) => {
    return new Promise((resolve, reject) => reject("Mock generateImage"));
  };

  beforeAll(async () => {
    const fontsDirectory = path.join(process.cwd(), "public", "fonts");
    const robotoRegular = await fs.readFile(
      path.join(fontsDirectory, "Roboto-Regular.ttf"),
    );
    const robotoMedium = await fs.readFile(
      path.join(fontsDirectory, "Roboto-Medium.ttf"),
    );

    generateImage = async ({ theme, videoDetails }) => {
      const scale = createScale(theme, 6);

      return satori(
        <YouTubeVideoCard
          scale={scale}
          theme={theme}
          videoDetails={videoDetails}
        />,
        {
          width: scale.width,
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
    };
  });

  it("should generate a valid image", async () => {
    expect(
      await generateImage({
        theme: schema.lightTheme,
        videoDetails: schema.defaultVideoDetails,
      }),
    ).toMatchImageSnapshot();
  });
});
