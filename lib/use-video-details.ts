"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import * as schema from "@/lib/schema";

async function fetchVideoDetails(
  videoId: string,
  signal: AbortSignal
): Promise<schema.VideoDetails> {
  const res = await fetch(`/api/youtube/video/${videoId}`, { signal });

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  return res.json();
}

export function useVideoDetails(videoUrl: string) {
  const [defaultVideoDetails] = useState(() =>
    schema.videoDetails.parse({
      channel: {},
    })
  );

  const [cache, setCache] = useState<Record<string, schema.VideoDetails>>({});
  const cacheRef = useRef(cache);

  useLayoutEffect(() => {
    cacheRef.current = cache;
  }, [cache]);

  const videoId = schema.getVideoId(videoUrl);

  useEffect(() => {
    if (videoId == null) {
      return;
    }

    if (cacheRef.current[videoId]) {
      return;
    }

    const abortController = new AbortController();

    fetchVideoDetails(videoId, abortController.signal).then((videoDetails) => {
      setCache((currentCache) => ({
        ...currentCache,
        [videoId]: videoDetails,
      }));
    });

    return () => abortController.abort("cleanup");
  }, [videoId]);

  return videoId ? cache[videoId] ?? defaultVideoDetails : defaultVideoDetails;
}
