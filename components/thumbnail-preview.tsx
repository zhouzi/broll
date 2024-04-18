/* eslint-disable @next/next/no-img-element */
import Color from "color";

import * as schema from "@/lib/schema";

export function createScale(theme: schema.Theme, baseScale: number) {
  function n(value: number) {
    return value * baseScale;
  }

  function px(value: number) {
    return `${n(value)}px`;
  }

  function text(scale: number) {
    const fontSize = n(16 * scale) * theme.card.fontSize;
    const lineHeight = fontSize * 1.2;

    return {
      fontSize: `${fontSize}px`,
      lineHeight: `${lineHeight}px`,
      fontWeight: 500,
    };
  }

  function spacing(scale: number) {
    return `${n(4 * scale) * theme.card.spacing}px`;
  }

  function borderRadius(scale: number) {
    return `${n(6 * scale) * theme.card.borderRadius}px`;
  }

  return { n, px, text, spacing, borderRadius };
}

interface ThumbnailPreviewProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
  scale: ReturnType<typeof createScale>;
}

export function ThumbnailPreview({
  videoDetails,
  theme,
  scale: { px, text, spacing, borderRadius },
}: ThumbnailPreviewProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.card.background,
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
        {theme.options.showDuration && (
          <div
            style={{
              position: "absolute",
              bottom: px(8),
              right: px(8),
              color: theme.duration.foreground,
              backgroundColor: theme.duration.background,
              borderRadius: borderRadius(1),
              padding: spacing(1),
              ...text(0.75),
            }}
          >
            {videoDetails.duration}
          </div>
        )}
        {typeof theme.options.progressBar === "number" && (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              height: px(4),
              width: "100%",
              display: "flex",
              backgroundColor: theme.progressBar.background,
            }}
          >
            <div
              style={{
                width: `${theme.options.progressBar}%`,
                backgroundColor: theme.progressBar.foreground,
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          color: theme.card.foreground,
          marginBottom: spacing(2),
          ...text(1),
        }}
      >
        {videoDetails.title}
      </div>
      {(theme.options.showViews || theme.options.showPublishedAt) && (
        <div
          style={{
            display: "flex",
            gap: px(4),
            color: Color(theme.card.foreground).fade(0.4).toString(),
            ...text(0.875),
            fontWeight: 400,
          }}
        >
          {theme.options.showViews && <span>{videoDetails.views}</span>}
          {theme.options.showViews && theme.options.showPublishedAt && (
            <span>·</span>
          )}
          {theme.options.showPublishedAt && (
            <span>{videoDetails.publishedAt}</span>
          )}
        </div>
      )}
    </div>
  );
}
