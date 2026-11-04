import type { Observable } from "@legendapp/state";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback } from "react";
import type { View } from "react-native";

/**
 * Sets `out$` while the title is under the header. Visibility, not pinning,
 * so an observer works here (unlike `useStuck`).
 * @platform web
 */
export function useTitleOut(out$: Observable<boolean> | undefined) {
  const headerHeight = Math.round(useHeaderHeight());

  return useCallback(
    (view: View | null) => {
      const el = view as unknown as HTMLElement | null;
      if (!el || !out$) return;
      const observer = new IntersectionObserver(
        ([entry]) =>
          // Above the line only: below it, the page hasn't reached it yet.
          out$.set(
            !entry.isIntersecting &&
              entry.boundingClientRect.top < headerHeight,
          ),
        { rootMargin: `-${headerHeight}px 0px 0px 0px` },
      );
      observer.observe(el);
      return () => {
        observer.disconnect();
        out$.set(false);
      };
    },
    [out$, headerHeight],
  );
}
