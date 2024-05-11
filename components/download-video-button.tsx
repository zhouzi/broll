import { Download, LoaderCircle } from "lucide-react";

import { useRenderVideo } from "@/lib/use-render-video";

import { Button } from "./ui/button";

import type * as schema from "@/lib/schema";

interface DownloadVideoButtonProps {
  theme: schema.Theme;
  videoDetails: schema.VideoDetails;
}

export function DownloadVideoButton({
  theme,
  videoDetails,
}: DownloadVideoButtonProps) {
  const { renderVideo, state } = useRenderVideo("YouTubeVideoCardVideo", {
    theme,
    videoDetails,
  });

  return (
    <Button onClick={renderVideo} disabled={state.status !== "idle"}>
      {state.status !== "idle" ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />{" "}
          Téléchargement... {Math.round(state.progress * 100)}%
        </>
      ) : (
        <>
          <Download className="mr-2 size-4" /> Télécharger
        </>
      )}
    </Button>
  );
}
