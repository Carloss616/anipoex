import type { DeepPartial } from "@apollo/client/utilities";
import type { MediaListStatus, MediaStatus } from "@/graphql/types.generated";
import type { MangaDetailFragment } from "../graphql/manga-fragments.generated";
import { type MangaEntry, toEntry } from "./to-entries";

export type MangaDetail = MangaEntry & {
  /** AniList's description, stripped to plain text. Empty when absent. */
  synopsis: string;
  /** Whether the manga itself is still running — not the user's list status. */
  publicationStatus: MediaStatus | null;
  /** Whoever is credited with the story, or the top-billed name. */
  author: string | null;
  /** User score from the list entry; `null` when unscored. */
  score: number | null;
  /** `null` when the manga isn't on the user's list. */
  listStatus: MediaListStatus | null;
};

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
  if (!html) return "";

  return html
    .replace(/<br\s*\/?>/gi, "\n")
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

  return (story ?? edges[0])?.node?.name?.full ?? null;
}

export function toDetail(
  id: number,
  media: DeepPartial<MangaDetailFragment> | null | undefined,
): MangaDetail | null {
  const entry = toEntry(id, media);
  if (!entry || !media) return null;

  return {
    ...entry,
    synopsis: toPlainText(media.description),
    publicationStatus: media.status ?? null,
    author: toAuthor(media.staff),
    score: media.mediaListEntry?.score ?? null,
    listStatus: media.mediaListEntry?.status ?? null,
  };
}
