"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import * as schema from "@/lib/schema";

const defaultVideoDetails = schema.videoDetails.parse({
  channel: {},
});

export function useVideoDetails(videoId: string) {
  const [cache, setCache] = useState<Record<string, schema.VideoDetails>>({
    [schema.DEFAULT_VIDEO_ID]: defaultVideoDetails,
  });
  const cacheRef = useRef(cache);

  const previousVideoIdRef = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    if (cacheRef.current[videoId]) {
      return;
    }

    const abortController = new AbortController();

    void fetch(`/api/youtube/video/${videoId}`, {
      signal: abortController.signal,
    }).then((res) => {
      if (res.ok) {
        return res.json().then((videoDetails: schema.VideoDetails) => {
          previousVideoIdRef.current = videoId;
          setCache((currentCache) => ({
            ...currentCache,
            [videoId]: videoDetails,
          }));
        });
      }

      toast.error(
        "Une erreur est survenue lors de la récupération des informations de la vidéo",
      );
    });

    return () => abortController.abort("cleanup");
  }, [videoId]);

  const cachedVideoDetails = cache[videoId];

  return useMemo(() => {
    const previousVideoId = previousVideoIdRef.current;
    const previousCachedVideoDetails = previousVideoId
      ? cacheRef.current[previousVideoId]
      : undefined;

    return {
      loading: cachedVideoDetails == null,
      videoDetails:
        cachedVideoDetails ?? previousCachedVideoDetails ?? defaultVideoDetails,
    };
  }, [cachedVideoDetails]);
}
