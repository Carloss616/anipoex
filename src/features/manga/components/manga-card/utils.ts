import type { SemanticColor } from "@/components/ui/colors";
import type { IconName } from "@/components/ui/icon";
import type { MediaStatus } from "@/graphql/types.generated";
import { STATUS_COLOR, STATUS_ICON } from "./constants";

/** A badge in the cover's corner: icon and colour. */
export interface CornerMark {
  icon: IconName;
  color: SemanticColor;
}

/** The corner badge: the caller's mark, else the release status. */
export const cornerBadge = (
  status: MediaStatus | null | undefined,
  mark: CornerMark | undefined,
): CornerMark | undefined =>
  mark ??
  (status
    ? { color: STATUS_COLOR[status], icon: STATUS_ICON[status] }
    : undefined);
