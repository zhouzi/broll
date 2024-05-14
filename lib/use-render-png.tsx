import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";

import { renderPNG, type Fonts } from "./render-png";

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
  ...props
}: UseDownloadPNGProps) {
  const setRenderStatusRef = useRef(props.setRenderStatus);

  useLayoutEffect(() => {
    setRenderStatusRef.current = props.setRenderStatus;
  }, [props.setRenderStatus]);

  const fontsRef = useRef<Fonts | undefined>(undefined);

  useEffect(() => {
    const abortContoller = new AbortController();

    void Promise.all([
      fetch("/fonts/Roboto-Regular.ttf", {
        signal: abortContoller.signal,
      }).then((res) => res.arrayBuffer()),
      fetch("/fonts/Roboto-Medium.ttf", {
        signal: abortContoller.signal,
      }).then((res) => res.arrayBuffer()),
    ]).then(([robotoRegular, robotoMedium]) => {
      if (abortContoller.signal.aborted) {
        return;
      }

      fontsRef.current = { robotoRegular, robotoMedium };
    });

    return () => abortContoller.abort("cleanup");
  }, []);

  const downloadPNGRef = useRef(
    () => new Promise((resolve, reject) => reject("not ready")),
  );
  const copyPNGRef = useRef(
    () => new Promise((resolve, reject) => reject("not ready")),
  );

  useLayoutEffect(() => {
    const renderPNGToBlob = async (status: RenderStatus) => {
      if (!fontsRef.current) {
        throw new Error("fonts not loaded");
      }

      setRenderStatusRef.current(status);

      const { blob } = await renderPNG({
        fonts: fontsRef.current,
        videoDetails,
        theme,
      });

      return blob;
    };
    copyPNGRef.current = async () => {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": await renderPNGToBlob("copying") }),
      ]);
      toast.success("Image copié dans ton presse papier");

      setRenderStatusRef.current("idle");
    };
    downloadPNGRef.current = async () => {
      const url = URL.createObjectURL(await renderPNGToBlob("downloading"));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${videoDetails.title}.png`;
      a.click();

      setRenderStatusRef.current("idle");
    };
  }, [fontsRef, theme, videoDetails]);

  const downloadPNG = useCallback(() => downloadPNGRef.current(), []);
  const copyPNG = useCallback(() => copyPNGRef.current(), []);

  return useMemo(() => ({ downloadPNG, copyPNG }), [downloadPNG, copyPNG]);
}
