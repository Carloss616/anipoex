---
type: GraphQL Query
title: MangaHistory
description: The viewer's list activity, newest first and 50 at a time, for every manga or one.
resource: ../../src/features/manga/graphql/manga-history.gql
tags: [history, activity]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-18T00:00:00Z }
---

```graphql
query MangaHistory($userId: Int!, $mediaId: Int, $page: Int!) {
  Page(page: $page, perPage: 50) {
    pageInfo { currentPage hasNextPage }
    activities(userId, mediaId, type: MANGA_LIST, sort: ID_DESC) { ...HistoryActivity }
  }
}
```

- **Asks for** each list activity's time (`createdAt`), its `status` text ("read chapter",
  "plans to read", "completed", "paused reading", "dropped"…), its `progress` text ("54",
  or "118 - 120" when AniList merged close updates) and the manga in the card shape of
  [manga](../concepts/manga.md).
- **Sent** when the History screen opens (cached results show meanwhile), then one page
  more each time its list reaches the end, never two at once. A page AniList already
  sent can repeat a row when new activity arrived meanwhile; the repeat is dropped.
- **Filtered by manga** with `mediaId`. Without a filter the variable is left out:
  AniList reads `mediaId: null` as a filter and answers an empty page.
- **Ends** when `hasNextPage` is false: the last page reaches the day the account was made;
  pages past it come back empty, not as an error.
- Error toast: "Couldn't load your history". A later page that fails shows a retry at
  the end of the list.
