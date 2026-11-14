import type { SemanticColor } from "@/components/ui/colors";
import { type IconName, Icons } from "@/components/ui/icon";
import type { MediaStatus } from "@/graphql/types.generated";

/** The cover's corner radius in native views; web takes `COVER_ROUNDED`. */
export const COVER_RADIUS = { ios: 24, android: 12 };

export const STATUS_COLOR: Record<MediaStatus, SemanticColor> = {
  FINISHED: "primary",
  RELEASING: "success",
  NOT_YET_RELEASED: "secondary",
  CANCELLED: "destructive",
  HIATUS: "warning",
};

/** A word doesn't fit a narrow cover; the spoken label keeps the name. */
export const STATUS_ICON: Record<MediaStatus, IconName> = {
  FINISHED: Icons.check,
  RELEASING: Icons.play,
  NOT_YET_RELEASED: Icons.hourglass,
  CANCELLED: Icons.close,
  HIATUS: Icons.pause,
};
