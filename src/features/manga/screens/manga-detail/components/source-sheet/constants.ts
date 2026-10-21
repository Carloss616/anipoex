import { Icons } from "@/components/ui/icon";
import type { CornerMark } from "@/features/manga/components/manga-card/utils";

/** The current match's corner badge, where the list shows the release status. */
export const CURRENT_MARK: CornerMark = {
  icon: Icons.checkCircle,
  color: "primary",
};

/** A card's cover, in points (dp on Android, px on web). */
export const COVER = { width: 80, height: 120 };
