/* eslint-disable react/no-unescaped-entities */
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Banner, BannerActions, BannerMessage } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export const BROWSER_EXTENSION_BANNER_DISMISSED_COOKIE_NAME =
  "browserExtensionBannerDismissed";

interface BrowserExtensionBannerProps {
  onDismiss: () => void;
}

export function BrowserExtensionBanner({
  onDismiss,
}: BrowserExtensionBannerProps) {
  return (
    <Banner>
      <BannerMessage>
        <Badge>nouveau</Badge> Télécharge la miniature depuis YouTube avec
        l'extension navigateur
      </BannerMessage>
      <BannerActions>
        <Button asChild>
          <a href="https://addons.mozilla.org/fr/firefox/addon/broll-youtube-thumbnail/">
            Ajouter à Firefox
          </a>
        </Button>
        <Button asChild>
          <a href="https://chromewebstore.google.com/detail/broll-vignette-youtube/cmngialhnhgajemigclojimhdfdckfln">
            Ajouter à Chrome
          </a>
        </Button>
        <Button size="icon" variant="ghost" onClick={onDismiss}>
          <X size={16} />
        </Button>
      </BannerActions>
    </Banner>
  );
}
