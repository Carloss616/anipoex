import type { SemanticColor } from "@/components/ui/colors";
import type { IconName } from "@/components/ui/icon";
import type { BadgeSegment } from "@/components/ui/split-badge";
import { downloadSegment } from "@/features/downloads/utils/download-segment";
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

/** The top-right pill: downloaded chapters, then unread (green, neutral at 0). */
export const countSegments = (
  downloads: number,
  unread: number | undefined,
): BadgeSegment[] => [
  ...(downloads > 0 ? [downloadSegment(downloads)] : []),
  ...(unread == null
    ? []
    : [
        {
          color: unread > 0 ? ("success" as const) : ("secondary" as const),
          label: String(unread),
        },
      ]),
];
