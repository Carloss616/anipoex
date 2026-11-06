import type { SectionId } from "../constants";
import type { HomeSectionsQueryVariables } from "../graphql/home-sections.generated";

/** `continue` has no flag: it comes from local reading state, not AniList. */
export function sectionVariables(
  visible: SectionId[],
  userId: number,
  now: Date,
): HomeSectionsQueryVariables {
  const on = (id: SectionId) => visible.includes(id);
  return {
    userId,
    // FuzzyDateInt is YYYYMMDD; zeros make it January 1st.
    year: Number(`${now.getFullYear()}0000`),
    trending: on("trending"),
    because: on("because"),
    genres: on("genres"),
    following: on("following"),
    releasing: on("releasing"),
    new: on("new"),
    top: on("top"),
    manhwa: on("manhwa"),
    planning: on("planning"),
    global: on("global"),
  };
}
