import type { SearchParams } from "@/features/manga/utils/search-params";

export type SectionId =
  | "continue"
  | "trending"
  | "because"
  | "genres"
  | "following"
  | "releasing"
  | "new"
  | "top"
  | "manhwa"
  | "planning"
  | "global";

export type Preset = "balanced" | "discover" | "personal";

export const SECTION_IDS: SectionId[] = [
  "continue",
  "trending",
  "because",
  "genres",
  "following",
  "releasing",
  "new",
  "top",
  "manhwa",
  "planning",
  "global",
];

export const PRESETS: Record<Preset, SectionId[]> = {
  balanced: [
    "continue",
    "trending",
    "because",
    "genres",
    "following",
    "releasing",
    "new",
  ],
  discover: [
    "trending",
    "releasing",
    "genres",
    "new",
    "top",
    "manhwa",
    "global",
  ],
  personal: ["continue", "because", "planning", "following", "trending"],
};

export const SECTIONS: Record<
  SectionId,
  {
    title: string;
    kind: "continue" | "hero" | "rail" | "genres" | "activity";
    params?: SearchParams;
  }
> = {
  continue: { title: "Continue reading", kind: "continue" },
  trending: {
    title: "Trending now",
    kind: "hero",
    params: { sort: "trending" },
  },
  because: { title: "Because you read …", kind: "rail" },
  genres: { title: "Browse by genre", kind: "genres" },
  following: { title: "Following", kind: "activity" },
  releasing: {
    title: "Popular releasing",
    kind: "rail",
    params: { status: "releasing", sort: "popularity" },
  },
  new: {
    title: "New this year",
    kind: "rail",
    params: { year: new Date().getFullYear(), sort: "popularity" },
  },
  top: { title: "Top rated", kind: "rail", params: { sort: "score" } },
  manhwa: {
    title: "Manhwa",
    kind: "rail",
    params: { country: "KR", sort: "popularity" },
  },
  planning: { title: "From your Planning", kind: "rail" },
  global: { title: "Reading now on AniList", kind: "activity" },
};
