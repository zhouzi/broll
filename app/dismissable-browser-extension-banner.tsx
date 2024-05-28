"use client";

import { serialize } from "cookie";
import { useEffect, useState } from "react";

import {
  BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME,
  BrowserExtensionBanner,
  type BrowserExtensionBannerProps,
} from "@/components/browser-extension-banner";

export interface DismissableBrowserExtensionBannerProps {
  browser: BrowserExtensionBannerProps["browser"];
  initialBrowserExtensionBannerDismissed: boolean;
}

export function DismissableBrowserExtensionBanner({
  browser,
  initialBrowserExtensionBannerDismissed,
}: DismissableBrowserExtensionBannerProps) {
  const [browserExtensionBannerDismissed, setBrowserExtensionBannerDismissed] =
    useState(initialBrowserExtensionBannerDismissed);

  useEffect(() => {
    if (browserExtensionBannerDismissed) {
      document.cookie = serialize(
        BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME,
        String(Date.now()),
      );
    }
  }, [browserExtensionBannerDismissed]);

  if (browserExtensionBannerDismissed) {
    return null;
  }

  return (
    <BrowserExtensionBanner
      browser={browser}
      onDismiss={() => setBrowserExtensionBannerDismissed(true)}
    />
  );
}
