---
type: GraphQL Query
title: MangaListCounts
description: Every list of the viewer's manga collection with its status and entry ids, and the custom list names — the input to the counts.
resource: ../../src/features/manga/graphql/manga-list.gql
tags: [manga, list, counts]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
query MangaListCounts($userId: Int!) {
  MediaListCollection(userId: $userId, type: MANGA, forceSingleCompletedList: true) {
    lists { name status isCustomList entries { id } }
    user { id mediaListOptions { mangaList { customLists } } }
  }
}
```

- Fetches ids only, so it stays cheap; the counting itself is the
  [list counts](../metrics/list-counts.md) metric.
- Also gives the account's [custom lists](../concepts/custom-list.md): their names in
  order from `user`, and how many manga each holds from its group (0 when it has none).
- A save or delete edits the cached result, like [MangaList](manga-list.md)'s.
- Shown from the cache, then read again from AniList whenever a screen that shows it
  mounts and whenever the app comes back to the foreground, so lists and counts changed
  on another device show up. Silent: a failure leaves the cached counts, with no toast.
