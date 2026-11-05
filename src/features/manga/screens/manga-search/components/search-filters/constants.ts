import type {
  SearchFormat,
  SearchSort,
} from "@/features/manga/utils/search-params";

/** "All" has no value: it clears the format. */
export const FORMAT_OPTIONS: { value?: SearchFormat; label: string }[] = [
  { label: "All" },
  { value: "manga", label: "Manga" },
  { value: "manhwa", label: "Manhwa" },
  { value: "manhua", label: "Manhua" },
  { value: "one-shot", label: "One-shot" },
];

export const SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: "relevance", label: "Relevance" },
  { value: "trending", label: "Trending" },
  { value: "popularity", label: "Popularity" },
  { value: "score", label: "Score" },
];
