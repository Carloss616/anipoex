import type { HeaderScrollProps } from "./use-header-scroll";

export function useHeaderScroll(): HeaderScrollProps {
  return { contentInsetAdjustmentBehavior: "automatic" };
}
