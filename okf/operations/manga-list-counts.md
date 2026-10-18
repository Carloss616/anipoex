---
type: GraphQL Query
title: MangaListCounts
description: Every list of the viewer's manga collection with its status and entry ids — the input to the per-status counts.
resource: ../../src/features/manga/graphql/manga-list-counts.gql
tags: [manga, list, counts]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
query MangaListCounts($userId: Int!) {
  MediaListCollection(userId: $userId, type: MANGA, forceSingleCompletedList: true) {
    lists { status isCustomList entries { id } }
  }
}
```

- Fetches ids only, so it stays cheap; the counting itself is the
  [list counts](../metrics/list-counts.md) metric.
- Refetched with [MangaList](manga-list.md) after every save or delete.
