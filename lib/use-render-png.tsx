"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";

import * as schema from "@/lib/schema";

import { renderPNG } from "./render-png";
import { useFontsRef } from "./use-fonts-ref";

export type RenderStatus = "idle" | "downloading" | "copying";

interface UseDownloadPNGProps {
  videoDetails: schema.VideoDetails;
  theme: schema.Theme;
  // eslint-disable-next-line no-unused-vars
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

  const fontsRef = useFontsRef();
  const downloadPNGRef = useRef(
    () => new Promise((resolve, reject) => reject("not ready"))
  );
  const copyPNGRef = useRef(() => {});

  useEffect(() => {
    copyPNGRef.current = async () => {
      if (!fontsRef.current) {
        throw new Error("fonts not loaded");
      }

      setRenderStatusRef.current("copying");

      const { blob } = await renderPNG({
        fonts: fontsRef.current,
        videoDetails,
        theme,
      });

      navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      toast.success("Image copié dans ton presse papier");

      setRenderStatusRef.current("idle");
    };
    downloadPNGRef.current = async () => {
      if (!fontsRef.current) {
        throw new Error("fonts not loaded");
      }

      setRenderStatusRef.current("downloading");

      const { blob } = await renderPNG({
        fonts: fontsRef.current,
        videoDetails,
        theme,
      });
      const url = URL.createObjectURL(blob);

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
