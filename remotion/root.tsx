import React from "react";
import { Composition } from "remotion";

import * as schema from "@/lib/schema";

import {
  YouTubeVideoCardVideo,
  YouTubeVideoCardVideoSchema,
} from "./youtube-video-card-video";

export function Root() {
  return (
    <>
      <Composition
        id={YouTubeVideoCardVideo.name}
        component={YouTubeVideoCardVideo}
        schema={YouTubeVideoCardVideoSchema}
        defaultProps={{
          theme: schema.lightTheme,
          videoDetails: schema.defaultVideoDetails,
        }}
        durationInFrames={120}
        fps={30}
        width={600}
        height={600}
      />
    </>
  );
}
