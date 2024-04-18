"use client";
import { useEffect, useState } from "react";

import * as schema from "@/lib/schema";

import { fetchVideoDetails } from "./fetch-video-details.action";

export function useVideoDetails(videoUrl: string) {
  const [videoDetails, setVideoDetails] = useState(
    schema.videoDetails.parse({})
  );

  const videoId = schema.getVideoId(videoUrl);
  useEffect(() => {
    let cancelled = false;

    if (videoId == null) {
      return;
    }

    fetchVideoDetails(videoId).then((videoDetails) => {
      fetch(`/api/base64?href=${videoDetails.thumbnail}`).then((res) => {
        if (res.ok) {
          res.text().then((base64) => {
            if (cancelled) {
              return;
            }

            setVideoDetails({ ...videoDetails, thumbnail: base64 });
          });
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return videoDetails;
}
