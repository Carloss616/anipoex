import { useThemeColor } from "@/hooks/use-theme-color";
import { SEMANTIC_COLOR, type SemanticColor } from "../../colors";

/** The `color` prop is either a semantic name or a raw color string. */
export function useSpinnerColor(color: SemanticColor | (string & {})) {
  const named = color in SEMANTIC_COLOR;
  const themed = useThemeColor(
    SEMANTIC_COLOR[named ? (color as SemanticColor) : "primary"].token.fill,
  );

  return named ? themed : color;
}
