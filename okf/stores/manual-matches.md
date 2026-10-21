---
type: Persisted Store
title: Manual matches
description: The page of a manga on a source that the user picked by hand from a title search.
resource: ../../src/features/manga/state/manual-matches.ts
tags: [sources, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Key `source-manual-matches`: `{ [anilistId]: { [sourceId]: { url, title, thumbnailUrl } } }`.
A **manual match** is the result the user chose from a title search of a
[source](../concepts/source.md) as that source's page for the manga, when matching by title
found nothing or the wrong manga.

It is read before any title search: picking the source uses it as the
[chosen source](source-matches.md)'s match, and a [probe](../concepts/source-probe.md) reads
its chapters instead of searching, so a scan never reports it as *no match*. Choosing it
also includes the source by hand ([pins](source-pins.md)), so a scan never
[auto-excludes](../concepts/source-exclusion.md) it. A new pick on the same source replaces
it; removing it sends the source back to matching by title (the pin stays). Reset all keeps
it, since it is not an exclusion. One record per manga and source, kept for every source
tried. Survives sign-out and doesn't sync.
