import { MediaStatus } from "@/graphql/types.generated";

/** How the manga itself is doing — distinct from the user's list status. */
export const PUBLICATION_STATUSES: Record<MediaStatus, string> = {
  [MediaStatus.Releasing]: "Publishing",
  [MediaStatus.Finished]: "Finished",
  [MediaStatus.Hiatus]: "On hiatus",
  [MediaStatus.NotYetReleased]: "Not yet published",
  [MediaStatus.Cancelled]: "Cancelled",
};
