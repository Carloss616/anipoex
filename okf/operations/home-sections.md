---
type: GraphQL Query
title: HomeSections
description: Every visible Home section in one request — rails of manga, the viewer's recommendations, list activity and the genre list.
resource: ../../src/features/home/graphql/home-sections.gql
tags: [home, discovery]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-05T00:00:00Z }
---

```graphql
query HomeSections($userId: Int!, $year: FuzzyDateInt!, $trending: Boolean!, …, $global: Boolean!) {
  trending: Page(perPage: 10) @include(if: $trending) { media(type: MANGA, isAdult: false, sort: TRENDING_DESC) { id ...MangaMedia } }
  …
  genres: GenreCollection @include(if: $genres)
}
```

- **One request per Home load.** Each section is an aliased field behind an
  `@include` flag, and a flag is on exactly when the section is visible in the
  [Home layout](../stores/home-layout.md); hidden sections cost nothing. *Continue
  reading* has no flag: it comes from what the device read, not from this query.
- **Variables**: the [viewer](../concepts/viewer.md)'s `id`, `year` as the
  [fuzzy date](../concepts/fuzzy-date.md) int of January 1st of the current year
  (`20260000`), and one flag per section. Skipped until the viewer is known.
- **Why one query**: AniList limits requests per minute (90, lowered to 30 when it is
  under load). Eleven sections as eleven queries would spend a tenth of a minute's
  allowance on every Home load; one query spends one request whatever the layout.

| Section | AniList field and arguments |
|---|---|
| `trending` | `Page(perPage: 10) { media(type: MANGA, isAdult: false, sort: TRENDING_DESC) }` |
| `releasing` | Same, `status: RELEASING, sort: POPULARITY_DESC` |
| `new` | Same, `startDate_greater: $year, sort: POPULARITY_DESC` |
| `top` | Same, `sort: SCORE_DESC` |
| `manhwa` | Same, `countryOfOrigin: "KR", sort: POPULARITY_DESC` |
| `planning` | `Page(perPage: 10) { mediaList(userId, type: MANGA, status: PLANNING, sort: UPDATED_TIME_DESC) }` |
| `because` | `Page(perPage: 1) { mediaList(userId, type: MANGA, status_in: [CURRENT, COMPLETED], sort: UPDATED_TIME_DESC) }`: the manga last read or completed (the list entry updated most recently), its title and its 10 best-rated recommendations, less those the viewer has completed |
| `following` | `Page(perPage: 8) { activities(isFollowing: true, type: MANGA_LIST, sort: ID_DESC) }`: list updates (status, progress, when, who, which manga) |
| `global` | Same as `following`, from everyone |
| `genres` | `GenreCollection` |

- Every manga comes in the card shape of [manga](../concepts/manga.md), so a tap opens
  its detail from the cache.
- Error toast: "Couldn't load Home".
