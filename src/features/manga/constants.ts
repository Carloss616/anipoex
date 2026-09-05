import { MediaListStatus, MediaStatus } from "@/graphql/types.generated";

/** How the manga itself is doing — distinct from the user's list status. */
export const PUBLICATION_STATUSES: Record<MediaStatus, string> = {
  [MediaStatus.Releasing]: "Releasing",
  [MediaStatus.Finished]: "Finished",
  [MediaStatus.Hiatus]: "Hiatus",
  [MediaStatus.NotYetReleased]: "Not yet released",
  [MediaStatus.Cancelled]: "Cancelled",
};

/** Where the user has filed the manga on their own list. */
export const MANGA_STATUSES: Record<MediaListStatus, string> = {
  [MediaListStatus.Current]: "Reading",
  [MediaListStatus.Planning]: "Planning",
  [MediaListStatus.Completed]: "Completed",
  [MediaListStatus.Paused]: "Paused",
  [MediaListStatus.Dropped]: "Dropped",
  [MediaListStatus.Repeating]: "Rereading",
};

/** `Object.entries` widens the key to `string`; the record is exhaustive by type. */
export const MANGA_STATUS_ENTRIES = Object.entries(MANGA_STATUSES) as [
  MediaListStatus,
  string,
][];
