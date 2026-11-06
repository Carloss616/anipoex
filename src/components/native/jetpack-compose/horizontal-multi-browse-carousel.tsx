import type { HorizontalMultiBrowseCarouselProps as BaseProps } from "@expo/ui/jetpack-compose";
import { requireNativeView } from "expo";

export interface HorizontalMultiBrowseCarouselProps
  extends Omit<
    BaseProps,
    "contentPadding" | "flingBehavior" | "userScrollEnabled"
  > {
  contentPadding?: {
    start?: number;
    top?: number;
    end?: number;
    bottom?: number;
  };
  /** Milliseconds an item rests before the next slides in; a drag restarts the wait. */
  autoAdvanceInterval?: number;
}

/**
 * M3's multi-browse carousel (`modules/carousel`): @expo/ui's, which can't be
 * moved from code, plus `autoAdvanceInterval`.
 */
export const HorizontalMultiBrowseCarousel =
  requireNativeView<HorizontalMultiBrowseCarouselProps>(
    "Carousel",
    "HorizontalMultiBrowseCarouselView",
  );
