import { cookies } from "next/headers";

import { BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME } from "@/components/browser-extension-banner";

import PageClient from "./page.client";

export default function Page() {
  const initialBrowserExtensionBannerDismissed = cookies().has(
    BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME,
  );

  return (
    <PageClient
      initialBrowserExtensionBannerDismissed={
        initialBrowserExtensionBannerDismissed
      }
    />
  );
}
