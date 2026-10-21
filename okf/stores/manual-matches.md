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
its chapters instead of searching. It says only which page is the manga; whether the source
is worth reading stays the scans' and the user's call: a manual match doesn't
[include or pin](../concepts/source-exclusion.md) the source, and excluding or including it,
by hand or by a scan, leaves the manual match alone. The one exception: setting it drops an
automatic *no match* exclusion of that source, which the page disproves (without a pin, so the
next scan judges the source again). A scan can still find it outdated, failing, or with no
chapters, and exclude it like any other. A new pick on the same source replaces it; removing it
sends the source back to matching by title. Reset all keeps it. One record per manga and
source. Survives sign-out and doesn't sync.
