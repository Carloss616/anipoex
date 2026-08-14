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
 * AniList descriptions are light HTML — `<br>`, `<i>`, `<b>`, the odd entity.
 * Stripping beats pulling in a renderer for markup this shallow; the ceiling is
 * that anything richer degrades to plain text rather than rendering.
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

/**
 * The staff list is sorted by relevance, so the story credit is normally first.
 * Matching on the role keeps the artist from being billed as the author on the
 * titles where they are listed ahead of the writer.
 */
function toAuthor(staff: DeepPartial<MangaDetailFragment>["staff"]) {
  const edges = staff?.edges?.filter((edge) => edge?.node?.name?.full) ?? [];
  const story = edges.find((edge) => /story/i.test(edge?.role ?? ""));

  return (story ?? edges[0])?.node?.name?.full;
}

export function toDetail(
  id: number,
  { staff, description, ...media }: DeepPartial<MangaDetailFragment>,
) {
  return {
    ...media,
    id,
    description: toPlainText(description),
    author: toAuthor(staff),
  };
}

export type MangaDetail = ReturnType<typeof toDetail>;
