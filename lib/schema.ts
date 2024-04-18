import dayjs from "dayjs";
import durationPlugin from "dayjs/plugin/duration";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import { z } from "zod";

import "dayjs/locale/fr";

dayjs.locale("fr");
dayjs.extend(durationPlugin);
dayjs.extend(relativeTimePlugin);

export const videoDetails = z.object({
  title: z.string().default("Je quitte mon CDI de Designer"),
  thumbnail: z
    .string()
    .url()
    .default("https://i3.ytimg.com/vi/XEO3duW1A80/maxresdefault.jpg"),
  duration: z
    .string()
    .default("PT9M27S")
    .transform((value) => {
      const duration = dayjs.duration(value);
      return duration.hours() > 0
        ? duration.format("HH:mm:ss")
        : duration.format("mm:ss");
    }),
  views: z
    .string()
    .default("0")
    .transform((value) => {
      const number = Number(value);
      return isNaN(number) ? 0 : number;
    })
    .transform((value) => {
      const formatter = new Intl.NumberFormat("fr-FR", {
        notation: "compact",
        compactDisplay: "short",
      });
      return `${formatter.format(value)} vues`;
    }),
  publishedAt: z
    .string()
    .default("2022-08-14T09:00:23Z")
    .transform((value) => {
      return dayjs(new Date(value)).fromNow();
    }),
});
export type VideoDetails = z.infer<typeof videoDetails>;

export const card = z.object({
  fontSize: z.number().min(0).max(2).default(1),
  foreground: z.string().default("#0f0f0f"),
  background: z.string().default("#ffffff"),
  spacing: z.number().min(0).max(2).default(1),
  borderRadius: z.number().min(0).max(2).default(1),
});

export const duration = z.object({
  foreground: z.string().default("#ffffff"),
  background: z.string().default("#2a2a2a"),
});

export const progressBar = z.object({
  foreground: z.string().default("#ff0000"),
  background: z.string().default("#c8c8c899"),
});

export const options = z.object({
  showDuration: z.boolean().default(true),
  showViews: z.boolean().default(true),
  showPublishedAt: z.boolean().default(true),
  progressBar: z.number().min(0).max(100).optional(),
});

export const theme = z.object({
  card,
  duration,
  progressBar,
  options,
});
export type Theme = z.infer<typeof theme>;

export function getVideoId(href: string) {
  try {
    const url = new URL(href);

    if (url.searchParams.has("v")) {
      return url.searchParams.get("v");
    }

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0];
    }

    if (
      url.hostname === "youtube.com" ||
      url.hostname.endsWith(".youtube.com")
    ) {
      const parts = url.pathname.split("/").slice(1);

      if (parts[0] === "shorts") {
        return parts[1];
      }

      if (parts[0] === "live") {
        return parts[1];
      }
    }
  } catch (err) {}

  return null;
}
