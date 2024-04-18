"use client";
import { useEffect, useState } from "react";

import * as schema from "@/lib/schema";

import { fetchVideoDetails } from "./fetch-video-details.action";

export function useVideoDetails(videoUrl: string) {
  const [videoDetails, setVideoDetails] = useState(
    schema.videoDetails.parse({
      channel: {},
    })
  );

  const videoId = schema.getVideoId(videoUrl);
  useEffect(() => {
    let cancelled = false;

    if (videoId == null) {
      return;
    }

    fetchVideoDetails(videoId).then((videoDetails) => {
      Promise.all([
        fetch(`/api/base64?href=${videoDetails.thumbnail}`).then((res) =>
          res.text()
        ),
        fetch(`/api/base64?href=${videoDetails.channel.thumbnail}`).then(
          (res) => res.text()
        ),
      ]).then(([thumbnail, channelThumbnail]) => {
        if (cancelled) {
          return;
        }

        setVideoDetails({
          ...videoDetails,
          thumbnail,
          channel: {
            ...videoDetails.channel,
            thumbnail: channelThumbnail,
          },
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  return videoDetails;
}
