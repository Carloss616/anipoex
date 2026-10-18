---
type: GraphQL Mutation
title: DeleteMangaTracking
description: Remove the viewer's list entry for a manga by entry id.
resource: ../../src/features/manga/graphql/manga-tracking.gql
tags: [tracking, mutation]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
mutation DeleteMangaTracking($id: Int!) { DeleteMediaListEntry(id: $id) { deleted } }
```

- Takes the **entry** id, not the media id.
- When `deleted` is true: `Media.mediaListEntry` becomes null, the `MediaList` is
  evicted from the cache and garbage-collected.
- Refetches [MangaList](manga-list.md) and [MangaListCounts](manga-list-counts.md).
- Failure toasts "Couldn't remove this from your list".
