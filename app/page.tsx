import { cookies, headers } from "next/headers";

import { BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME } from "@/components/browser-extension-banner";

import PageClient, { type PageClientProps } from "./page.client";

export default function Page() {
  const initialBrowserExtensionBannerDismissed = cookies().has(
    BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME,
  );
  const userAgent = headers().get("User-Agent") ?? "";
  const browser: PageClientProps["browser"] = userAgent.includes("Chrome")
    ? "Chrome"
    : userAgent.toLowerCase().includes("firefox")
      ? "Firefox"
      : undefined;

  return (
    <PageClient
      browser={browser}
      initialBrowserExtensionBannerDismissed={
        initialBrowserExtensionBannerDismissed
      }
    />
  );
}
