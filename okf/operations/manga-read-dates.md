---
type: GraphQL Query
title: MangaReadDates
description: The viewer's list activity for one manga, newest and oldest first, to date a Completed set long after the last chapter.
resource: ../../src/features/manga/graphql/manga-read-dates.gql
tags: [tracking, activity]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-15T00:00:00Z }
---

```graphql
query MangaReadDates($userId: Int!, $mediaId: Int!) {
  latest: Page(perPage: 50) { activities(userId, mediaId, type: MANGA_LIST, sort: ID_DESC) { ...ListActivity } }
  earliest: Page(perPage: 10) { activities(userId, mediaId, type: MANGA_LIST, sort: ID) { ...ListActivity } }
}
```

- **Asks for** each list activity's time (`createdAt`), its `status` text ("read chapter",
  "completed", "paused reading"…) and its `progress` text ("120", or "118 - 120" when
  AniList merged updates).
- **Sent** when the tracking sheet's status or progress view opens for an entry that isn't
  Completed, has progress and lacks a start or finish date; what it gives is described in
  [tracking rules](../concepts/tracking-rules.md).
- **Page sizes**: the 50 newest reach past status-only activities (paused, dropped) to the
  newest chapter read and spot an earlier Completed; the 10 oldest reach past "plans to
  read" and other status changes to the first chapter read.
- **Never cached** and **silent**: read fresh on each open, and a failure only falls back to
  today's date.
