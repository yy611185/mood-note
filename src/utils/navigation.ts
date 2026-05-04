import { Href } from "expo-router";

export type HomeHref = "/calendar" | "/record" | "/profile";

type BackRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

export function goBackOrHome(router: BackRouter, homeHref: HomeHref): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(homeHref);
}
