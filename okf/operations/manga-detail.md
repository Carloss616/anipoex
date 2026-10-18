---
type: GraphQL Query
title: MangaDetail
description: One manga by AniList id, with the detail fields and the viewer's full list entry.
resource: ../../src/features/manga/graphql/manga-detail.gql
tags: [manga, detail]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
query MangaDetail($id: Int!) { Media(id: $id, type: MANGA) { id ...MangaDetail } }
```

- **Returns** the detail shape of [manga](../concepts/manga.md): list fields plus
  description, banner, `averageScore`, start year, 6 staff by relevance, and the
  [list entry](../concepts/list-entry.md) (status, progress, score, dates, notes).
- **Cache first**: the screen reads the `MangaDetail` fragment from the cache and only
  sends the query when that fragment is incomplete. What [MangaList](manga-list.md)
  already fetched paints at once; the query fills in the rest.
- Pull to refresh always hits the network.
- Error toast: "Couldn't load this manga".
