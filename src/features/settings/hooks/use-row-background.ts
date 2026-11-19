import { listRowBackground } from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";

/** The fill of a settings `Section`'s rows on iOS. */
export function useRowBackground() {
  return listRowBackground(useThemeColor("surface-secondary"));
}
