import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";

/** What the user did, as it reads before the title: "read chapter 12 of". */
export const activityAction = ({ status, progress }: HomeActivityFragment) =>
  progress ? `${status} ${progress} of` : (status ?? "");

/** How long ago `createdAt` (AniList's seconds) was, short: "5m ago". */
export function timeAgo(createdAt: number, now = Date.now()) {
  const minutes = Math.floor((now / 1000 - createdAt) / 60);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
