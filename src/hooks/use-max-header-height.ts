import { useHeaderHeight } from "expo-router/react-navigation";
import { useRef } from "react";

/**
 * The header at its tallest. `useHeaderHeight` shrinks with the collapsing title,
 * and padding that followed it would drag the content up by that same row.
 */
export function useMaxHeaderHeight() {
  const height = useHeaderHeight();
  const max = useRef(0);

  max.current = Math.max(max.current, height);

  return max.current;
}
