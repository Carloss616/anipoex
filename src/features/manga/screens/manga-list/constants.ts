import { MediaListStatus } from "@/graphql/types";

export const MANGA_STATUSES = [
  { status: MediaListStatus.Current, title: "Reading" },
  { status: MediaListStatus.Planning, title: "Plan to read" },
  { status: MediaListStatus.Completed, title: "Completed" },
  { status: MediaListStatus.Paused, title: "Paused" },
  { status: MediaListStatus.Dropped, title: "Dropped" },
] as const;
