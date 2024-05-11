import {
  speculateFunctionName,
  getRenderProgress,
} from "@remotion/lambda/client";
import { type NextRequest } from "next/server";

import { DISK, RAM, REGION, TIMEOUT } from "@/remotion/lambda.config";

export type RenderProgressResponse =
  | { type: "error"; message: string }
  | { type: "done"; url: string; size: number }
  | { type: "progress"; progress: number };

export async function POST(
  request: NextRequest,
  {
    params: { bucketName, renderId },
  }: { params: { bucketName: string; renderId: string } },
) {
  const renderProgress = await getRenderProgress({
    bucketName,
    renderId,
    region: REGION,
    functionName: speculateFunctionName({
      diskSizeInMb: DISK,
      memorySizeInMb: RAM,
      timeoutInSeconds: TIMEOUT,
    }),
  });

  if (renderProgress.fatalErrorEncountered) {
    const json: RenderProgressResponse = {
      type: "error",
      message: renderProgress.errors[0].message,
    };
    return Response.json(json, { status: 500 });
  }

  if (renderProgress.done) {
    const json: RenderProgressResponse = {
      type: "done",
      url: renderProgress.outputFile!,
      size: renderProgress.outputSizeInBytes!,
    };
    return Response.json(json);
  }

  const json: RenderProgressResponse = {
    type: "progress",
    progress: Math.max(0.03, renderProgress.overallProgress),
  };
  return Response.json(json);
}
