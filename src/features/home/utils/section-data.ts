import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { SECTIONS, type SectionId } from "../constants";
import type {
  HomeActivityFragment,
  HomeSectionsQuery,
} from "../graphql/home-sections.generated";

type Data = HomeSectionsQuery | undefined;

const present = <T>(list: (T | null | undefined)[] | null | undefined) =>
  (list ?? []).filter((x): x is T => x != null);

/** The manga a rail or the hero shows; empty while it isn't loaded. */
export function sectionMedia(data: Data, id: SectionId): MangaEntry[] {
  switch (id) {
    case "trending":
    case "releasing":
    case "new":
    case "top":
    case "manhwa":
      return present(data?.[id]?.media);
    case "planning":
      return present(data?.planning?.mediaList?.map((entry) => entry?.media));
    case "because":
      return present(
        data?.because?.mediaList?.[0]?.media?.recommendations?.nodes?.map(
          (node) => node?.mediaRecommendation,
        ),
      );
    default:
      return [];
  }
}

/** List activities only; AniList's following feed includes the viewer's own. */
export const sectionActivities = (
  data: Data,
  id: "following" | "global",
  viewerId?: number,
): HomeActivityFragment[] =>
  present(data?.[id]?.activities).filter(
    (a): a is HomeActivityFragment =>
      a.__typename === "ListActivity" && a.user?.id !== viewerId,
  );

/** AniList lists its adult genre too; every section asks for `isAdult: false`. */
export const sectionGenres = (data: Data) =>
  present(data?.genres).filter((genre) => genre !== "Hentai");

/** "Because you read" names the manga once it's loaded. */
export function sectionTitle(data: Data, id: SectionId) {
  const read =
    id === "because" &&
    data?.because?.mediaList?.[0]?.media?.title?.userPreferred;
  return read ? `Because you read ${read}` : SECTIONS[id].title;
}
