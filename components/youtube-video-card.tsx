/* eslint-disable @next/next/no-img-element */
import Color from "color";

import type * as schema from "@/lib/schema";

export function createScale(theme: schema.Theme, baseFactor: number) {
  function scale(value: number) {
    return value * baseFactor;
  }

  scale.width = scale(450);

  scale.fontSize = function fontSize(factor: number) {
    return scale(16 * factor) * theme.card.fontSize;
  };

  scale.lineHeight = function lineHeight(factor: number) {
    return scale.fontSize(factor) * 1.2;
  };

  scale.text = function text(factor: number) {
    return {
      fontSize: `${scale.fontSize(factor)}px`,
      lineHeight: `${scale.lineHeight(factor)}px`,
      fontWeight: 500,
    };
  };

  scale.padding = function padding(factor: number) {
    return scale(4 * factor) * theme.card.spacing;
  };

  scale.borderRadius = function borderRadius(factor: number) {
    return scale(6 * factor) * theme.card.borderRadius;
  };

  return scale;
}

interface YouTubeVideoCardProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
  scale: ReturnType<typeof createScale>;
}

export function YouTubeVideoCard({
  videoDetails,
  theme,
  scale,
}: YouTubeVideoCardProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.card.background,
        padding: `${scale.padding(7.5)}px`,
        borderRadius: `${scale.borderRadius(2) + scale.padding(7.5)}px`,
        width: `${scale.width}px`,
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: `${scale.fontSize(0.6)}px`,
          borderRadius: `${scale.borderRadius(2)}px`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <img src={videoDetails.thumbnail} alt="" />
        {theme.options.showDuration && (
          <div
            style={{
              position: "absolute",
              bottom: `${scale(8)}px`,
              right: `${scale(8)}px`,
              color: theme.duration.foreground,
              backgroundColor: theme.duration.background,
              borderRadius: `${scale.borderRadius(2) - scale(8)}px`,
              padding: `${scale.fontSize(0.2)}px`,
              ...scale.text(0.75),
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
              height: `${scale(4)}px`,
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
      <div style={{ display: "flex", gap: `${scale.fontSize(0.6)}px` }}>
        {theme.options.showChannelThumbnail && (
          <img
            src={videoDetails.channel.thumbnail}
            alt=""
            style={{
              borderRadius: "100%",
              width: `${scale.fontSize(2.6)}px`,
              height: `${scale.fontSize(2.6)}px`,
              // Nécessaire pour l'export. Satori ne gère pas width: 0
              display: scale.fontSize(2.6) ? 'none' : 'block',
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              color: theme.card.foreground,
              marginBottom: `${scale.fontSize(0.35)}px`,
              ...scale.text(1),
            }}
          >
            {videoDetails.title}
          </div>
          {theme.options.showChannelTitle && (
            <div
              style={{
                display: "flex",
                color: Color(theme.card.foreground).fade(0.4).toString(),
                ...scale.text(0.875),
                fontWeight: 400,
              }}
            >
              {videoDetails.channel.title}
            </div>
          )}
          {(theme.options.showViews || theme.options.showPublishedAt) && (
            <div
              style={{
                color: Color(theme.card.foreground).fade(0.4).toString(),
                ...scale.text(0.875),
                fontWeight: 400,
                marginTop: `${scale.fontSize(0.2)}px`,
              }}
            >
              {[
                theme.options.showViews && videoDetails.views,
                theme.options.showPublishedAt && videoDetails.publishedAt,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
