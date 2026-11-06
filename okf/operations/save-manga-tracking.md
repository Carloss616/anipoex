---
type: GraphQL Mutation
title: SaveMangaTracking
description: Create or edit the viewer's list entry for a manga — status, progress, score and both dates in one call.
resource: ../../src/features/manga/graphql/manga-tracking.gql
tags: [tracking, mutation]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Wraps AniList's `SaveMediaListEntry`.

| Variable | Sent as |
|---|---|
| `id` | The entry id; omitted on the first save, which creates the entry. |
| `mediaId` | The manga's AniList id. Always sent. |
| `status` | The [list status](../concepts/list-status.md), or omitted. |
| `progress` | Chapters read. |
| `score` | In the viewer's [score format](../concepts/score-format.md). |
| `startedAt`, `completedAt` | [Fuzzy dates](../concepts/fuzzy-date.md), each only when the user changed it; a cleared one is the null triple, which erases. |

- Returns the entry's `MangaTracking` fields and its media in the list shape
  (`MangaMedia`); Apollo merges both by id. The media's `mediaListEntry` comes back
  null, so the app writes that link itself after every save.
- Nothing is refetched: the app files the entry under its status in the cached
  [MangaList](manga-list.md) and [MangaListCounts](manga-list-counts.md) results, first
  in its list, and takes it out of the others. A list not cached yet fetches it when opened.
- Success and failure each get a haptic; failure also toasts "Couldn't save your changes"
  and puts the field back to what AniList still has.
- `notes` is never sent, so AniList keeps it.
