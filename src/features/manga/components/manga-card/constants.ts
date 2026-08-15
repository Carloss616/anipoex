import type { SemanticColor } from "@/components/ui/colors";
import type { MediaStatus } from "@/graphql/types.generated";

export const STATUS_COLOR: Record<MediaStatus, SemanticColor> = {
  FINISHED: "success",
  RELEASING: "primary",
  NOT_YET_RELEASED: "secondary",
  CANCELLED: "destructive",
  HIATUS: "warning",
};
