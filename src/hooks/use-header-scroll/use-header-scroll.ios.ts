import type { HeaderScrollProps } from "./use-header-scroll";

/**
 * UIKit collapses the large title itself, as long as the screen's first scroll
 * view lets the system own its inset — React Native's default is `never`.
 */
export function useHeaderScroll(): HeaderScrollProps {
  return { contentInsetAdjustmentBehavior: "automatic" };
}
