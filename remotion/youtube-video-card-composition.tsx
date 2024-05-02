import { type CSSProperties } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { z } from "zod";

import { YouTubeVideoCard, createScale } from "@/components/youtube-video-card";
import * as schema from "@/lib/schema";

const waitForFont = delayRender();
const robotoRegular = new FontFace(
  `Roboto`,
  `url('${staticFile("fonts/Roboto-Regular.ttf")}') format('truetype')`,
  {
    weight: "400",
    style: "normal",
  },
);
const robotoMedium = new FontFace(
  `Roboto`,
  `url('${staticFile("fonts/Roboto-Medium.ttf")}') format('truetype')`,
  {
    weight: "500",
    style: "normal",
  },
);

Promise.all([robotoRegular.load(), robotoMedium.load()])
  .then((fonts) => {
    fonts.forEach((font) => {
      document.fonts.add(font);
    });

    continueRender(waitForFont);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.log("Error loading font", err);
  });

function fadeIn({
  frame,
  fps,
  durationInFrames,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
}) {
  const progress = spring({ frame, fps, durationInFrames });

  return {
    opacity: progress,
  };
}

function slideUp({
  frame,
  fps,
  durationInFrames,
}: {
  frame: number;
  fps: number;
  durationInFrames: number;
}) {
  const progress = spring({ frame, fps, durationInFrames });

  return {
    transform: `translateY(${20 * (1 - progress)}px)`,
  };
}

function compose(
  { frame, fps, delay }: { frame: number; fps: number; delay: number },
  ...fns: Array<
    (args: {
      frame: number;
      fps: number;
      durationInFrames: number;
    }) => CSSProperties
  >
) {
  return fns.reduce(
    (acc, fn) =>
      Object.assign(
        acc,
        fn({ frame: frame - delay, fps, durationInFrames: 30 }),
      ),
    {},
  );
}

export const YouTubeVideoCardCompositionSchema = z.object({
  videoDetails: schema.videoDetails,
});

export function YouTubeVideoCardComposition({
  videoDetails,
}: z.infer<typeof YouTubeVideoCardCompositionSchema>) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <YouTubeVideoCard
        theme={schema.lightTheme}
        videoDetails={videoDetails}
        scale={createScale(schema.lightTheme, 1)}
        animation={{
          container: compose({ frame, fps, delay: 0 }, fadeIn, slideUp),
          thumbnail: compose({ frame, fps, delay: 5 }, fadeIn),
          title: compose({ frame, fps, delay: 10 }, fadeIn, slideUp),
          channelTitle: compose({ frame, fps, delay: 15 }, fadeIn, slideUp),
          stats: compose({ frame, fps, delay: 20 }, fadeIn, slideUp),
        }}
      />
    </AbsoluteFill>
  );
}
