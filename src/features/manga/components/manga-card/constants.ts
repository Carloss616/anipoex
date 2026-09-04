import type { SemanticColor } from "@/components/ui/colors";
import type { MediaStatus } from "@/graphql/types.generated";

export const STATUS_COLOR: Record<MediaStatus, SemanticColor> = {
  FINISHED: "primary",
  RELEASING: "success",
  NOT_YET_RELEASED: "secondary",
  CANCELLED: "destructive",
  HIATUS: "warning",
};
