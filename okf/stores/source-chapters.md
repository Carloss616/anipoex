---
type: Persisted Store
title: Source chapters
description: The chapter list each source last answered with for each manga, kept without expiry.
resource: ../../src/features/manga/utils/chapter-storage/chapter-storage.ts
tags: [sources, chapters, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

One entry per manga and source, keyed `anilistId/sourceId`, `{ manga, chapters }`: the
source's page for the manga (`url`, `title`, as [matched](source-matches.md), and its cover
when a scan or a title search found it, kept across refreshes of the same page) and its own
chapters there (url, name, number, scanlator, upload date, memo). Native keeps each entry
under its own key in the MMKV store `source-chapters`; web and desktop keep one record per
entry in the IndexedDB database `source-chapters` (store `chapters`), since a list can be
large. An entry is read only when it is needed, never all at once.

Written whenever the chapters load, so every source tried for a manga keeps its list. It
never expires: the detail and the reader show it without asking the source again while
the match is the same, and picking a source that has an entry reuses its page instead of
searching, so switching back to it is instant. Only a refresh (pull to refresh or the
Refresh button) fetches the current source again; a failed refresh keeps the stored list.
A source that becomes excluded for the manga loses its entry. A scan writes every source it
finds the manga in, so picking one of them after a scan is instant too, and a list on
screen follows a scan of its source.
Survives sign-out and doesn't sync.

Meaning: [chapter](../concepts/chapter.md).
