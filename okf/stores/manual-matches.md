---
type: Persisted Store
title: Manual matches
description: The page of a manga on a source that the user picked by hand from a title search.
resource: ../../src/features/manga/state/manual-matches.ts
tags: [sources, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Key `source-manual-matches`: `{ [anilistId]: { [sourceId]: { url, title, thumbnailUrl, memo? } } }`,
`memo` being the source's own data for the page, absent on matches set before it was kept.
A **manual match** is the result the user chose from a title search of a
[source](../concepts/source.md) as that source's page for the manga, when matching by title
found nothing or the wrong manga.

It is read before any title search: picking the source uses it as the
[chosen source](source-matches.md)'s match, and a [probe](../concepts/source-probe.md) reads
its chapters instead of searching. Setting it on an excluded source is a correction of its
match, not a verdict on the source: the exclusion and its [pin](source-pins.md) go, whoever set
them, so the source moves to the available ones while it is probed again (its probe shows there
and can be stopped), and that probe judges it like any other: a scan can find it outdated,
failing, or with no chapters, and exclude it again. On a source that isn't excluded it changes
nothing, pin included. Excluding or including the source later, by hand or by a scan, leaves the
manual match alone. A new pick on the same source replaces it; removing it
sends the source back to matching by title. Reset all keeps it. One record per manga and
source. Survives sign-out and doesn't sync.
