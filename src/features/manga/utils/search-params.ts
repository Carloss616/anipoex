import { SECTIONS } from "@/features/home/constants";
import { MediaFormat, MediaSort, MediaStatus } from "@/graphql/types.generated";
import type { MangaSearchQueryVariables } from "../graphql/manga-search.generated";

const FORMATS = ["manga", "manhwa", "manhua", "one-shot"] as const;
const SORTS = ["relevance", "trending", "popularity", "score"] as const;
const STATUSES = ["releasing", "finished", "hiatus"] as const;
const COUNTRIES = ["JP", "KR", "CN"] as const;

export type SearchFormat = (typeof FORMATS)[number];
export type SearchSort = (typeof SORTS)[number];
export type SearchStatus = (typeof STATUSES)[number];

export type SearchParams = {
  q?: string;
  genre?: string;
  format?: SearchFormat;
  sort?: SearchSort;
  status?: SearchStatus;
  country?: (typeof COUNTRIES)[number];
  year?: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const SORT_KEYS: Record<SearchSort, MediaSort> = {
  relevance: MediaSort.SearchMatch,
  trending: MediaSort.TrendingDesc,
  popularity: MediaSort.PopularityDesc,
  score: MediaSort.ScoreDesc,
};

const STATUS_KEYS: Record<SearchStatus, MediaStatus> = {
  releasing: MediaStatus.Releasing,
  finished: MediaStatus.Finished,
  hiatus: MediaStatus.Hiatus,
};

// AniList has no manhwa format: it's a manga from Korea, and so on.
const FORMAT_KEYS: Record<
  SearchFormat,
  { format: MediaFormat; country?: string }
> = {
  manga: { format: MediaFormat.Manga, country: "JP" },
  manhwa: { format: MediaFormat.Manga, country: "KR" },
  manhua: { format: MediaFormat.Manga, country: "CN" },
  "one-shot": { format: MediaFormat.OneShot },
};

const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const oneOf = <T extends string>(list: readonly T[], v: string | undefined) =>
  list.find((x) => x === v);

/** The URL's params, without any value AniList wouldn't take. */
export function parseSearchParams(raw: RawParams): SearchParams {
  const year = Number(first(raw.year));
  const params: SearchParams = {
    q: first(raw.q),
    genre: first(raw.genre),
    format: oneOf(FORMATS, first(raw.format)),
    sort: oneOf(SORTS, first(raw.sort)),
    status: oneOf(STATUSES, first(raw.status)),
    country: oneOf(COUNTRIES, first(raw.country)),
    year: Number.isInteger(year) && year > 0 ? year : undefined,
  };
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined),
  );
}

export const hasSearch = (p: SearchParams) => Object.keys(p).length > 0;

export function toSearchVariables(
  p: SearchParams,
  page: number,
): MangaSearchQueryVariables {
  const format = p.format && FORMAT_KEYS[p.format];
  return {
    page,
    search: p.q,
    genre: p.genre,
    format: format?.format,
    country: format ? format.country : p.country,
    status: p.status && STATUS_KEYS[p.status],
    sort: [SORT_KEYS[p.sort ?? (p.q ? "relevance" : "popularity")]],
    startDateGreater: p.year && p.year * 10000,
  };
}

/** For `router.push` and `router.setParams`. */
export const toRouteParams = (p: SearchParams): Record<string, string> =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]));

/** The query, else the Home section these params show, else the genre. */
export function searchTitle(p: SearchParams): string {
  if (p.q) return p.q;
  const keys = Object.keys(p);
  const section = Object.values(SECTIONS).find(
    ({ params }) =>
      params &&
      keys.length === Object.keys(params).length &&
      Object.entries(params).every(
        ([k, v]) => p[k as keyof SearchParams] === v,
      ),
  );
  return section?.title ?? p.genre ?? "Search";
}
