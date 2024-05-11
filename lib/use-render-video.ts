"use client";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { type RenderProgressResponse } from "@/app/api/lambda/progress/[bucketName]/[renderId]/route";
import { type YouTubeVideoCardVideoSchema } from "@/remotion/youtube-video-card-video";

type State =
  | {
      status: "idle";
    }
  | {
      status: "rendering";
      progress: number;
    };

const RenderResponseSchema = z.object({
  renderId: z.string(),
  bucketName: z.string(),
});

export function useRenderVideo(
  compositionId: "YouTubeVideoCardVideo",
  inputProps: z.infer<typeof YouTubeVideoCardVideoSchema>,
) {
  const [state, setState] = useState<State>({
    status: "idle",
  });

  const renderVideo = useCallback(async () => {
    setState({
      status: "rendering",
      progress: 0,
    });

    const res = await fetch(`/api/lambda/render/${compositionId}`, {
      method: "POST",
      body: JSON.stringify(inputProps),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const { bucketName, renderId } = RenderResponseSchema.parse(
      (await res.json()) as unknown,
    );

    let pending = true;

    while (pending) {
      const res = await fetch(
        `/api/lambda/progress/${bucketName}/${renderId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const json = (await res.json()) as RenderProgressResponse;

      switch (json.type) {
        case "error": {
          toast.error(json.message);
          pending = false;
          break;
        }
        case "done": {
          const a = document.createElement("a");
          a.href = json.url;
          a.click();

          setState({ status: "idle" });
          pending = false;
          break;
        }
        case "progress": {
          setState({
            status: "rendering",
            progress: json.progress,
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }, [compositionId, inputProps]);

  return useMemo(
    () => ({
      renderVideo,
      state,
    }),
    [renderVideo, state],
  );
}
