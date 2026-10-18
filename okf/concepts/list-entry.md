---
type: Domain Concept
title: List entry
description: The user's MediaList row for one manga — status, progress, score, start and finish dates — created on first save and deleted outright.
tags: [tracking, anilist, list]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
verified: { by: human:carlos-espinoza, at: 2026-10-18T00:00:00Z }
---

A **list entry** is the user's AniList `MediaList` row for one [manga](manga.md). There
is at most one per user and manga; `Media.mediaListEntry` points to it, or is null
when the manga is not on the list.

| Field | Meaning |
|---|---|
| `id` | Entry id. Absent until the first save creates the entry. |
| `status` | Its [list status](list-status.md). |
| `progress` | Chapters read. Integer ≥ 0, capped at the manga's `chapters` when known. |
| `score` | In the viewer's [score format](score-format.md); `0` means unscored. |
| `startedAt`, `completedAt` | [Fuzzy dates](fuzzy-date.md). |
| `notes` | Read but never written: the app sends no `notes`, so AniList keeps them. |

# Lifecycle

- **Created** by the first [SaveMangaTracking](../operations/save-manga-tracking.md)
  without an `id` (only `mediaId`). The app then links the new entry to its media in
  the cache, which Apollo cannot infer on its own.
- **Edited** by the same mutation with the `id`. The sheet always sends every field it
  owns (status, progress, score, both dates), so a save overwrites all of them; see
  [tracking rules](tracking-rules.md) for what the form fills in.
- **Removed** by [DeleteMangaTracking](../operations/delete-manga-tracking.md): the
  entry is gone on AniList, unlinked from the media and evicted from the cache.

Any save or delete refetches the list and its [counts](../metrics/list-counts.md),
since a status change moves the entry between lists.
