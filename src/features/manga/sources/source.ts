import type { SemanticColor } from "@/components/ui/colors";

/** Where chapters come from. One entry per site the app can read. */
export interface Source {
  id: string;
  name: string;
  /**
   * Drawn on the tile when the source has no icon of its own — which is all of
   * them today. A real registry would carry a favicon and fall back to this.
   */
  initials: string;
  /** The tile's tint, from the theme's own hues rather than a palette of its own. */
  color: SemanticColor;
}
