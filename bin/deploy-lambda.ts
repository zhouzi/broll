/* eslint-disable no-console */
import path from "path";

import {
  deployFunction,
  deploySite,
  getOrCreateBucket,
} from "@remotion/lambda";

import { env } from "@/env";
import {
  REGION,
  RAM,
  TIMEOUT,
  SITE_NAME,
  overrideWebpackConfig,
} from "@/remotion/lambda.config";

void (async () => {
  console.log(`Région sélectionnée pour la lambda : ${REGION}`);

  if (!env.REMOTION_AWS_ACCESS_KEY_ID || !env.REMOTION_AWS_SECRET_ACCESS_KEY) {
    console.log(
      "Les variables d'environnement pour l'accès à AWS sont manquantes, voir la documentation : https://www.remotion.dev/docs/lambda/setup",
    );
    return;
  }

  console.log("Déploiement de la lambda... ");

  const { functionName, alreadyExisted: functionAlreadyExisted } =
    await deployFunction({
      createCloudWatchLogGroup: true,
      memorySizeInMb: RAM,
      region: REGION,
      timeoutInSeconds: TIMEOUT,
    });
  console.log(
    functionName,
    functionAlreadyExisted ? "(existait déjà)" : "(créée)",
  );

  console.log("Vérification du bucket...");
  const { bucketName, alreadyExisted: bucketAlreadyExisted } =
    await getOrCreateBucket({
      region: REGION,
    });
  console.log(bucketName, bucketAlreadyExisted ? "(existait déjà)" : "(créé)");

  console.log("Déploiement du site... ");
  const { siteName } = await deploySite({
    bucketName,
    entryPoint: path.resolve(process.cwd(), "remotion", "index.ts"),
    siteName: SITE_NAME,
    region: REGION,
    options: {
      webpackOverride: overrideWebpackConfig,
    },
  });
  console.log(siteName);

  console.log();
  console.log("Déploiement terminé, le rendu vidéo est maintenant disponible");
})();
