"use client";

import { serialize } from "cookie";
import { useEffect, useState } from "react";

import {
  BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME,
  BrowserExtensionBanner,
} from "@/components/browser-extension-banner";

interface DismissableBrowserExtensionBannerProps {
  initialBrowserExtensionBannerDismissed: boolean;
}

export function DismissableBrowserExtensionBanner({
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
      onDismiss={() => setBrowserExtensionBannerDismissed(true)}
    />
  );
}
