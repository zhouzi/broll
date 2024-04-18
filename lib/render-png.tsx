import satori from "satori";

import { ThumbnailPreview, createScale } from "@/components/thumbnail-preview";
import * as schema from "@/lib/schema";

import { Fonts } from "./use-fonts-ref";

interface MessageData {
  _id: number;
  blob: Blob;
}

const convertSVGToPNG = (() => {
  if (typeof window === "undefined") {
    return;
  }

  const worker = new Worker(new URL("./resvg-worker.ts", import.meta.url));

  // eslint-disable-next-line no-unused-vars
  const pending = new Map<number, (messageData: MessageData) => void>();

  worker.onmessage = (e: MessageEvent<MessageData>) => {
    const resolve = pending.get(e.data._id);

    if (resolve) {
      resolve(e.data);
      pending.delete(e.data._id);
    }
  };

  return async (msg: object) => {
    const _id = Math.random();

    worker.postMessage({
      ...msg,
      _id,
    });

    return new Promise<MessageData>((resolve) => {
      pending.set(_id, resolve);
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
    <ThumbnailPreview
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
    }
  );
  const messageData = (await convertSVGToPNG?.({
    svg,
    width: scale.width,
  }))!;

  return messageData;
}
