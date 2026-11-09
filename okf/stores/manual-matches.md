---
type: Persisted Store
title: Manual matches
description: The page of a manga on a source that the user picked by hand from a title search.
resource: ../../src/features/manga/state/manual-matches.ts
tags: [sources, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-21T00:00:00Z }
---

Key `source-manual-matches`: `{ [anilistId]: { [sourceId]: { url, title, thumbnailUrl, memo?, by? } } }`,
`memo` being the source's own data for the page, absent on matches set before it was kept;
`by: "title"` on a page taken because its title equals a known one, not picked by the user.
A **manual match** is the result the user chose from a title search of a
[source](../concepts/source.md) as that source's page for the manga, when matching by title
found nothing or the wrong manga.

It is read before any title search: picking the source uses it as the
[chosen source](source-matches.md)'s match, and a [probe](../concepts/source-probe.md) reads
its chapters instead of searching. Setting it on an excluded source is a correction of its
match, not a verdict on the source: its [pin](source-pins.md) goes, whoever set the exclusion,
and the source stays excluded while it is probed again (its probe shows on its row and can be
stopped). That probe decides: the exclusion is dropped if the source now reads fine, or kept,
as automatic, if it is outdated, failing, or has no chapters. On a source that isn't excluded it changes
nothing, pin included. Excluding or including the source later, by hand or by a scan, leaves the
manual match alone. A new pick on the same source replaces it; removing it
sends the source back to matching by title. Reset all keeps it. One record per manga and
source. Survives sign-out and doesn't sync.

Its title also teaches the manga's other sources: a scan, a pick and a search by title on them
take a page equal to it ([chosen source](source-matches.md)), since sources often list a manga
under a translated name AniList doesn't have. When the user picks a match in the search by
title, the other sources whose loaded results hold that title take it as a `by: "title"`
record; undoing that, or removing one of those, drops it and leaves the source unmatched
without searching again, as a search would take the same page back. A removed match no longer
teaches.
