"use client";
import { useCallback, useEffect, useRef } from "react";
import satori from "satori";

import { ThumbnailPreview, createScale } from "@/components/thumbnail-preview";
import * as schema from "@/lib/schema";

import { renderPNG } from "./render-png";
import { useFontsRef } from "./use-fonts-ref";

interface UseDownloadPNGProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
}

export function useDownloadPNG({ videoDetails, theme }: UseDownloadPNGProps) {
  const fontsRef = useFontsRef();
  const downloadRef = useRef(
    () => new Promise((resolve, reject) => reject("not ready"))
  );

  useEffect(() => {
    downloadRef.current = async () => {
      if (!fontsRef.current) {
        throw new Error("fonts not loaded");
      }

      const scale = createScale(theme, 6);
      const width = scale.n(450);

      const svg = await satori(
        <ThumbnailPreview
          videoDetails={videoDetails}
          theme={theme}
          scale={scale}
        />,
        {
          width,
          fonts: [
            {
              name: "Roboto",
              data: fontsRef.current.robotoRegular,
              weight: 400,
              style: "normal",
            },
            {
              name: "Roboto",
              data: fontsRef.current.robotoMedium,
              weight: 500,
              style: "normal",
            },
          ],
        }
      );
      const url = (await renderPNG?.({
        svg,
        width,
      })) as string;

      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoDetails.title}.png`;
      a.click();
    };
  }, [fontsRef, theme, videoDetails]);

  return useCallback(() => downloadRef.current(), []);
}
