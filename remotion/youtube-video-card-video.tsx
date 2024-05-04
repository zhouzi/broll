import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  continueRender,
  delayRender,
  staticFile,
  interpolate,
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

function slide({
  frame,
  fps,
  delay,
  durationInFrames,
}: {
  frame: number;
  fps: number;
  delay: number;
  durationInFrames: number;
}) {
  const animationDuration = 30;

  const enterStartsAt = 0 + delay;
  const enterEndsAt = enterStartsAt + animationDuration;

  const leaveStartsAt = durationInFrames - animationDuration - delay;

  const progress =
    frame < enterEndsAt
      ? spring({
          frame: frame - enterStartsAt,
          fps,
          durationInFrames: animationDuration,
        })
      : frame > leaveStartsAt
        ? spring({
            frame: frame - leaveStartsAt,
            fps,
            durationInFrames: animationDuration,
            reverse: true,
          })
        : 1;

  return {
    opacity: progress,
    transform: `translateY(${20 * (1 - progress)}px)`,
  };
}

export const YouTubeVideoCardVideoSchema = z.object({
  theme: schema.theme,
  videoDetails: schema.videoDetails,
});

export function YouTubeVideoCardVideo({
  theme,
  videoDetails,
}: z.infer<typeof YouTubeVideoCardVideoSchema>) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const progressBarProgress = theme.options.progressBar ?? 100;

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <YouTubeVideoCard
        theme={theme}
        videoDetails={videoDetails}
        scale={createScale(theme, 1)}
        animation={{
          container: slide({
            frame,
            fps,
            delay: 0,
            durationInFrames,
          }),
          thumbnail: slide({
            frame,
            fps,
            delay: 5,
            durationInFrames,
          }),
          progressBarProgress: {
            width: `${interpolate(
              frame,
              [0, durationInFrames],
              [
                progressBarProgress,
                Math.min(100, progressBarProgress + durationInFrames / fps),
              ],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            )}%`,
          },
          title: slide({
            frame,
            fps,
            delay: 10,
            durationInFrames,
          }),
          channelTitle: slide({
            frame,
            fps,
            delay: 15,
            durationInFrames,
          }),
          stats: slide({
            frame,
            fps,
            delay: 20,
            durationInFrames,
          }),
        }}
      />
    </AbsoluteFill>
  );
}
