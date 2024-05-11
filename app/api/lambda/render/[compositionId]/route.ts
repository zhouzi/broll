import {
  renderMediaOnLambda,
  speculateFunctionName,
} from "@remotion/lambda/client";
import { type NextRequest } from "next/server";

import { env } from "@/env";
import {
  DISK,
  RAM,
  REGION,
  SITE_NAME,
  TIMEOUT,
} from "@/remotion/lambda.config";

import type * as schema from "@/lib/schema";

export async function POST(
  request: NextRequest,
  { params: { compositionId } }: { params: { compositionId: string } },
) {
  if (!env.REMOTION_AWS_ACCESS_KEY_ID || !env.REMOTION_AWS_SECRET_ACCESS_KEY) {
    throw new Error(
      "Les variables d'environnement pour l'accès à AWS sont manquantes, voir la documentation : https://www.remotion.dev/docs/lambda/setup",
    );
  }

  const inputProps = (await request.json()) as {
    // TODO: this is duplicated from @/remotion/youtube-video-card-video.tsx
    //       but we can't import it because it pulls packages that are not compatible with this environment
    //       also, we don't want to re-parse the inputs
    theme: schema.Theme;
    videoDetails: schema.VideoDetails;
  };

  return Response.json(
    await renderMediaOnLambda({
      codec: "vp8",
      pixelFormat: "yuva420p",
      imageFormat: "png",
      functionName: speculateFunctionName({
        diskSizeInMb: DISK,
        memorySizeInMb: RAM,
        timeoutInSeconds: TIMEOUT,
      }),
      region: REGION,
      serveUrl: SITE_NAME,
      composition: compositionId,
      inputProps,
      framesPerLambda: 10,
      downloadBehavior: {
        type: "download",
        fileName: `${inputProps.videoDetails.title}.webm`,
      },
    }),
  );
}
