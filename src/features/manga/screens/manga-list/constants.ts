import { MediaListStatus } from "@/graphql/types.generated";

export const MANGA_STATUSES = [
  { status: MediaListStatus.Current, title: "Reading" },
  { status: MediaListStatus.Planning, title: "Planning" },
  { status: MediaListStatus.Completed, title: "Completed" },
  { status: MediaListStatus.Paused, title: "Paused" },
  { status: MediaListStatus.Dropped, title: "Dropped" },
] as const;
