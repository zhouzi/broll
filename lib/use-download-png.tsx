"use client";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import satori from "satori";

import { ThumbnailPreview, createScale } from "@/components/thumbnail-preview";
import * as schema from "@/lib/schema";

import { renderPNG } from "./render-png";
import { useFontsRef } from "./use-fonts-ref";

export type DownloadStatus = "idle" | "inprogress" | "complete";

interface UseDownloadPNGProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
  // eslint-disable-next-line no-unused-vars
  setDownloadStatus: (status: DownloadStatus) => void;
}

export function useDownloadPNG({
  videoDetails,
  theme,
  ...props
}: UseDownloadPNGProps) {
  const setDownloadStatusRef = useRef(props.setDownloadStatus);

  useLayoutEffect(() => {
    setDownloadStatusRef.current = props.setDownloadStatus;
  }, [props.setDownloadStatus]);

  const fontsRef = useFontsRef();
  const downloadRef = useRef(
    () => new Promise((resolve, reject) => reject("not ready"))
  );

  useEffect(() => {
    downloadRef.current = async () => {
      if (!fontsRef.current) {
        throw new Error("fonts not loaded");
      }

      setDownloadStatusRef.current("inprogress");

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

      setDownloadStatusRef.current("complete");
    };
  }, [fontsRef, theme, videoDetails]);

  return useCallback(() => downloadRef.current(), []);
}
