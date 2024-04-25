import satori from "satori";

import { YouTubeVideoCard, createScale } from "@/components/youtube-video-card";

import type * as schema from "@/lib/schema";

export interface Fonts {
  robotoRegular: ArrayBuffer;
  robotoMedium: ArrayBuffer;
}

interface Message {
  _id: number;
  svg: string;
  width: number;
}

interface WorkerResponse {
  _id: number;
  blob: Blob;
}

const convertSVGToPNG = (() => {
  if (typeof window === "undefined") {
    return;
  }

  const worker = new Worker(new URL("./resvg-worker.ts", import.meta.url));

  const pending = new Map<number, (messageData: WorkerResponse) => void>();

  worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const resolve = pending.get(e.data._id);

    if (resolve) {
      resolve(e.data);
      pending.delete(e.data._id);
    }
  };

  return async ({ svg, width }: Pick<Message, "svg" | "width">) => {
    const message: Message = {
      _id: Math.random(),
      svg,
      width,
    };

    worker.postMessage(message);

    return new Promise<WorkerResponse>((resolve) => {
      pending.set(message._id, resolve);
    });
  };
})();

interface RenderPNGProps {
  fonts: Fonts;
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
}

export async function renderPNG({
  fonts,
  videoDetails,
  theme,
}: RenderPNGProps) {
  const scale = createScale(theme, 6);

  const svg = await satori(
    <YouTubeVideoCard
      videoDetails={videoDetails}
      theme={theme}
      scale={scale}
    />,
    {
      width: scale.width,
      fonts: [
        {
          name: "Roboto",
          data: fonts.robotoRegular,
          weight: 400,
          style: "normal",
        },
        {
          name: "Roboto",
          data: fonts.robotoMedium,
          weight: 500,
          style: "normal",
        },
      ],
      loadAdditionalAsset: async (code, segment) => {
        if (code === "emoji") {
          const hex = segment.codePointAt(0)?.toString(16);
          if (hex) {
            const res = await fetch(
              `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${hex}.svg`
            );

            if (res.ok) {
              const blob = await res.blob();
              return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.addEventListener("loadend", () => {
                  resolve(reader.result as string);
                });
                reader.addEventListener("error", reject);

                reader.readAsDataURL(blob);
              });
            }
          }
        }

        return segment;
      },
    }
  );
  const messageData = (await convertSVGToPNG?.({
    svg,
    width: scale.width,
  }))!;

  return messageData;
}
