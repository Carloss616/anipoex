import { Icons } from "@/components/ui/icon";
import type { CornerMark } from "@/features/manga/components/manga-card/utils";

/** The current match's corner badge, where the list shows release status. */
export const CURRENT_MARK: CornerMark = {
  icon: Icons.checkCircle,
  color: "primary",
};

/**
 * A match taken because its title equals a known one: another glyph than the
 * user's own, so it doesn't rest on color.
 */
export const BY_TITLE_MARK: CornerMark = { icon: Icons.tag, color: "success" };

/** The result closest to the manga's titles: suggested, never taken. */
export const SIMILAR_MARK: CornerMark = { icon: Icons.info, color: "warning" };

/** A card's cover, in points (dp on Android, px on web). */
export const COVER = { width: 80, height: 120 };
