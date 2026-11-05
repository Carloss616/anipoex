import { useWindowDimensions } from "react-native";

export type SizeClass = "compact" | "medium" | "expanded";

/** Home's web breakpoints: one column, rails with arrows, a side column. */
export function useSizeClass(): SizeClass {
  const { width } = useWindowDimensions();
  return width < 600 ? "compact" : width < 1024 ? "medium" : "expanded";
}
