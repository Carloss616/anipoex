import type { DeepPartial } from "@apollo/client/utilities";
import type { MangaDetailFragment } from "../graphql/manga-fragments.generated";

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  "#039": "'",
};

/**
 * AniList descriptions are light HTML (`<br>`, `<i>`, `<b>`, entities), so
 * stripping beats a renderer; anything richer degrades to plain text.
 */
function toPlainText(html: string | null | undefined) {
  return html
    ?.replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(
      /&(amp|lt|gt|quot|#039);/g,
      (match, name) => ENTITIES[name] ?? match,
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** By role, not first in the list: some titles bill the artist first. */
function toAuthor(staff: DeepPartial<MangaDetailFragment>["staff"]) {
  const edges = staff?.edges?.filter((edge) => edge?.node?.name?.full) ?? [];
  const story = edges.find((edge) => /story/i.test(edge?.role ?? ""));

  return (story ?? edges[0])?.node?.name?.full;
}

/** Nothing for an unknown id (empty media) or a media without a title. */
export function toDetail(
  id: number,
  media: DeepPartial<MangaDetailFragment> | null | undefined,
) {
  if (!media?.title) return undefined;

  const { staff, description, ...rest } = media;

  return {
    ...rest,
    id,
    description: toPlainText(description),
    author: toAuthor(staff),
  };
}

export type MangaDetail = NonNullable<ReturnType<typeof toDetail>>;
