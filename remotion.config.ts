import { Config } from "@remotion/cli/config";

import { overrideWebpackConfig } from "./remotion/lambda.config";

Config.overrideWebpackConfig(overrideWebpackConfig);
