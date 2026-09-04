import { MediaStatus } from "@/graphql/types.generated";

/** How the manga itself is doing — distinct from the user's list status. */
export const PUBLICATION_STATUSES: Record<MediaStatus, string> = {
  [MediaStatus.Releasing]: "Releasing",
  [MediaStatus.Finished]: "Finished",
  [MediaStatus.Hiatus]: "Hiatus",
  [MediaStatus.NotYetReleased]: "Not yet released",
  [MediaStatus.Cancelled]: "Cancelled",
};
