"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import * as schema from "@/lib/schema";

const defaultVideoDetails = schema.videoDetails.parse({
  channel: {},
});

export function useVideoDetails(videoId: string) {
  const [cache, setCache] = useState<Record<string, schema.VideoDetails>>({
    [schema.DEFAULT_VIDEO_ID]: defaultVideoDetails,
  });
  const cacheRef = useRef(cache);

  useLayoutEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  useEffect(() => {
    if (cacheRef.current[videoId]) {
      return;
    }

    const abortController = new AbortController();

    fetch(`/api/youtube/video/${videoId}`, {
      signal: abortController.signal,
    }).then((res) => {
      if (res.ok) {
        res.json().then((videoDetails) => {
          setCache((currentCache) => ({
            ...currentCache,
            [videoId]: videoDetails,
          }));
        });
      }
    });

    return () => abortController.abort("cleanup");
  }, [videoId]);

  return cache[videoId] ?? defaultVideoDetails;
}
