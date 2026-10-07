import type { SemanticColor } from "@/components/ui/colors";
import { Icon, type IconName } from "@/components/ui/icon";
import type { MediaStatus } from "@/graphql/types.generated";

export const STATUS_COLOR: Record<MediaStatus, SemanticColor> = {
  FINISHED: "primary",
  RELEASING: "success",
  NOT_YET_RELEASED: "secondary",
  CANCELLED: "destructive",
  HIATUS: "warning",
};

/** A word doesn't fit a narrow cover; the card's spoken label keeps the name. */
export const STATUS_ICON: Record<MediaStatus, IconName> = {
  FINISHED: Icon.select({
    ios: "checkmark",
    android: require("@expo/material-symbols/check.xml"),
    web: "check",
  }),
  RELEASING: Icon.select({
    ios: "play.fill",
    android: require("@expo/material-symbols/play_arrow.xml"),
    web: "play",
  }),
  NOT_YET_RELEASED: Icon.select({
    ios: "hourglass",
    android: require("@expo/material-symbols/hourglass.xml"),
    web: "hourglass",
  }),
  CANCELLED: Icon.select({
    ios: "xmark",
    android: require("@expo/material-symbols/close.xml"),
    web: "x",
  }),
  HIATUS: Icon.select({
    ios: "pause.fill",
    android: require("@expo/material-symbols/pause.xml"),
    web: "pause",
  }),
};
