import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { renderPNG, type Fonts } from "./render-png";

import type * as schema from "@/lib/schema";

export type RenderStatus = "idle" | "downloading" | "copying";

const copyAction = async (blob: Blob) => {
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
  toast.success("Image copié dans ton presse papier");
};

const downloadAction = async (blob: Blob, title?: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.png`;
  a.click();
};

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

      fontsRef.current = { robotoRegular, robotoMedium };
    });

    return () => abortContoller.abort("cleanup");
  }, []);

  const onDownload = (type: Exclude<RenderStatus, "idle">) => async () => {
    if (!fontsRef.current) {
      throw new Error("fonts not loaded");
    }

    setRenderStatus(type);

    const { blob } = await renderPNG({
      fonts: fontsRef.current,
      videoDetails,
      theme,
    });

    if (type === "copying") {
      await copyAction(blob);
    } else {
      await downloadAction(blob, videoDetails.title);
    }

    setRenderStatus("idle");

    return blob;
  };

  const downloadPNG = onDownload("downloading");

  const copyPNG = onDownload("copying");

  return {
    downloadPNG,
    copyPNG,
  };
}
