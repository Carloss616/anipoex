---
type: Persisted Store
title: Source chapters
description: The chapter list each manga's matched source last answered with, kept without expiry.
resource: ../../src/features/manga/utils/chapter-storage/chapter-storage.ts
tags: [sources, chapters, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

One entry per AniList id, `{ sourceId, url, chapters }`: the source's own chapters (url,
name, number, scanlator, upload date, memo) for the manga [matched](source-matches.md) at
`sourceId` / `url`. Native keeps each entry under its own key in the MMKV store
`source-chapters`; web and desktop keep one record per manga in the IndexedDB database
`source-chapters` (store `chapters`), since a list can be large. An entry is read only
when its manga opens, never all at once. Written whenever the chapters load; one
list per manga, so loading another source's replaces it. It never expires: the detail and
the reader show it without asking the source again while the match is the same, and only
a refresh (pull to refresh or the Refresh button) fetches again. A failed refresh keeps the
stored list. Source scans don't write it. Survives sign-out and doesn't sync.

Meaning: [chapter](../concepts/chapter.md).
