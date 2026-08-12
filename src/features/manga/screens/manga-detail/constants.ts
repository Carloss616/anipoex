import { Platform } from "react-native";
import { MediaStatus } from "@/graphql/types.generated";

/** How the manga itself is doing — distinct from the user's list status. */
export const PUBLICATION_STATUSES: Record<MediaStatus, string> = {
  [MediaStatus.Releasing]: "Publishing",
  [MediaStatus.Finished]: "Finished",
  [MediaStatus.Hiatus]: "On hiatus",
  [MediaStatus.NotYetReleased]: "Not yet published",
  [MediaStatus.Cancelled]: "Cancelled",
};

/**
 * Native buttons tint their own icons; on web the Icon needs the color spelled
 * out. A `web:` variant can't do it — Uniwind resolves `accent-*` against a
 * detached DOM node, where the platform variant never matches.
 */
export const WEB_ICON_COLOR =
  Platform.OS === "web" ? "accent-accent" : undefined;
