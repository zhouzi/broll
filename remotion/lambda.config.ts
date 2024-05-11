import path from "node:path";

import { type WebpackConfiguration } from "@remotion/cli/config";
import { type AwsRegion } from "@remotion/lambda";

export function overrideWebpackConfig(config: WebpackConfiguration) {
  return {
    ...config,
    resolve: {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        "@": path.join(process.cwd()),
      },
    },
  };
}

export const REGION: AwsRegion = "eu-west-3";
export const SITE_NAME = "broll.gabin.app";
export const RAM = 3008;
export const DISK = 2048;
export const TIMEOUT = 240;
