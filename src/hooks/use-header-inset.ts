import { useHeaderHeight } from "expo-router/react-navigation";
import { useRef } from "react";
import { Platform } from "react-native";

/**
 * The header at its tallest. `useHeaderHeight` shrinks with the collapsing title,
 * and padding that followed it would drag the content up by that same row.
 */
export function useHeaderInset() {
  const height = useHeaderHeight();
  const max = useRef(0);

  max.current = Math.max(max.current, height);

  return Platform.OS === "web" ? max.current : undefined;
}
