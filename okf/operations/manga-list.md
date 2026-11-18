---
type: GraphQL Query
title: MangaList
description: The viewer's manga filed under one list status, or the whole collection for a custom list, with what a card needs.
resource: ../../src/features/manga/graphql/manga-list.gql
tags: [manga, list, custom-list]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
query MangaList($userId: Int!, $status: MediaListStatus, $forceSingleCompletedList: Boolean = true) {
  MediaListCollection(userId: $userId, type: MANGA, status: $status, forceSingleCompletedList: $forceSingleCompletedList) {
    lists { name isCustomList entries { id progress updatedAt createdAt score media { id ...MangaMedia } } }
  }
}
```

- **Variables**: the [viewer](../concepts/viewer.md)'s `id` and one
  [list status](../concepts/list-status.md). Skipped until the viewer is known.
- **A custom list**: AniList can't filter a collection by
  [custom list](../concepts/custom-list.md), so an opened one reads the whole collection
  (no status) and takes the custom group with its name; one cached result serves every
  custom list. It passes `forceSingleCompletedList: false`: with the arguments of
  [MangaListCounts](manga-list-counts.md) it would share that query's cached groups, and
  each would overwrite the other's fields.
- **Returns** each entry's media in the list shape of [manga](../concepts/manga.md):
  titles, synonyms, cover, genres, publication status, `chapters`, and the entry's
  `id` and `progress`.
- Each entry also carries `updatedAt`, `createdAt` (unix seconds) and `score`, read
  outside the media: the list's filters and sort use them (started, last updated,
  date added, score). Dates are absent when AniList has none; a score of 0 means
  unscored.
- Flattened to one array of media from the status's own groups: AniList also returns the
  custom lists holding its entries, which would repeat them.
  Genre filter and search run on the device over it.
- A save or delete edits the cached results instead of refetching them, the whole
  collection's custom groups included, and deleting a list drops its group; a pull to
  refresh refetches it together with [MangaListCounts](manga-list-counts.md).
- Error toast: "Couldn't load this list".
