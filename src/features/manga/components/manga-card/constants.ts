import type { BadgeColor } from "@/components/ui/badge";
import type { MediaStatus } from "@/graphql/types.generated";

export const STATUS_COLOR: Record<MediaStatus, BadgeColor> = {
  FINISHED: "success",
  RELEASING: "accent",
  NOT_YET_RELEASED: "default",
  CANCELLED: "danger",
  HIATUS: "warning",
};
