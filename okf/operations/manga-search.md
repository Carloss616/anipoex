---
type: GraphQL Query
title: MangaSearch
description: One page of AniList manga matching a search — text, genre, format, country, status and start year — sorted by match or popularity.
resource: ../../src/features/manga/graphql/manga-search.gql
tags: [search, discovery]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-05T00:00:00Z }
---

```graphql
query MangaSearch($page: Int!, $search: String, $genre: String, $format: MediaFormat,
  $country: CountryCode, $status: MediaStatus, $sort: [MediaSort], $startDateGreater: FuzzyDateInt) {
  Page(page: $page, perPage: 30) {
    pageInfo { hasNextPage }
    media(type: MANGA, isAdult: false, search: $search, genre: $genre, format: $format,
      countryOfOrigin: $country, status: $status, sort: $sort, startDate_greater: $startDateGreater) {
      id ...MangaMedia
    }
  }
}
```

- **Sent on submit only**: typing never sends a request. The search's parameters live
  in the `/search` URL (`q`, `genre`, `format`, `sort`, `status`, `country`, `year`);
  a value AniList wouldn't take is dropped before the request.
- **Pages** of 30, `isAdult: false`; the next page loads while `hasNextPage`.
- **Sort**: `relevance` → `SEARCH_MATCH`, `trending` → `TRENDING_DESC`, `popularity` →
  `POPULARITY_DESC`, `score` → `SCORE_DESC`. With no sort picked: `SEARCH_MATCH` when
  there is text, else `POPULARITY_DESC`.
- **Format**: AniList has no manhwa or manhua format, so they are manga by country:
  `manga` → `MANGA` from `JP`, `manhwa` → `MANGA` from `KR`, `manhua` → `MANGA` from
  `CN`, `one-shot` → `ONE_SHOT` from any country. A picked format sets the country; a
  lone `country` applies only without one.
- **Status**: `releasing`, `finished`, `hiatus` → `RELEASING`, `FINISHED`, `HIATUS`.
- **Year** → `startDate_greater: YYYY0000`, a [fuzzy date](../concepts/fuzzy-date.md)
  int: manga that started in that year or later.
- A Home section with search parameters opens this same search with them, and
  the page takes the section's title.
- Results come in the card shape of [manga](../concepts/manga.md).
