import type { HomeActivityFragment } from "@/features/home/graphql/home-sections.generated";

/** What the user did, as it reads before the title: "read chapter 12 of". */
export const activityAction = ({ status, progress }: HomeActivityFragment) =>
  progress ? `${status} ${progress} of` : (status ?? "");
