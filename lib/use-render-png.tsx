import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import { renderPNG, type Fonts } from "./render-png";
import { useLatestCallback } from "./use-latest-callback";

import type * as schema from "@/lib/schema";

export type RenderStatus = "idle" | "downloading" | "copying";

interface UseDownloadPNGProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
  setRenderStatus: (status: RenderStatus) => void;
}

export function useRenderPNG({
  videoDetails,
  theme,
  setRenderStatus,
}: UseDownloadPNGProps) {
  const fontsRef = useRef<Fonts | undefined>(undefined);

  useEffect(() => {
    const abortContoller = new AbortController();

    void Promise.all([
      fetch("/fonts/Roboto-Regular.ttf", {
        signal: abortContoller.signal,
      }).then((res) => res.arrayBuffer()),
      fetch("/fonts/Roboto-Medium.ttf", { signal: abortContoller.signal }).then(
        (res) => res.arrayBuffer(),
      ),
    ]).then(([robotoRegular, robotoMedium]) => {
      if (abortContoller.signal.aborted) {
        return;
      }

      fontsRef.current = {
        robotoRegular,
        robotoMedium,
      };
    });

    return () => abortContoller.abort("cleanup");
  }, []);

  const renderPNGToBlob = async (status: RenderStatus) => {
    if (!fontsRef.current) {
      throw new Error("fonts not loaded");
    }

    setRenderStatus(status);

    const { blob } = await renderPNG({
      fonts: fontsRef.current,
      videoDetails,
      theme,
    });

    return blob;
  };

  const downloadPNG = useLatestCallback(async () => {
    const url = URL.createObjectURL(await renderPNGToBlob("downloading"));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoDetails.title}.png`;
    a.click();

    setRenderStatus("idle");
  });

  const copyPNG = useLatestCallback(async () => {
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": await renderPNGToBlob("copying") }),
    ]);
    toast.success("Image copié dans ton presse papier");

    setRenderStatus("idle");
  });

  return useMemo(() => ({ downloadPNG, copyPNG }), [downloadPNG, copyPNG]);
}
