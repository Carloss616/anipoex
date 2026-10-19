---
type: Persisted Store
title: Chosen source
description: The source picked for each manga, keyed by AniList id.
resource: ../../src/features/manga/state/source.ts
tags: [sources, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Key `manga-source`: `{ [anilistId]: { sourceId, manga? } }`. The pick is stored the moment
the user makes it, so the detail names the source at once; `manga` is added when the search
ends. A `sourceId` without `manga` is a search still pending: it resumes when the detail
opens and retries on refresh, and a failed search leaves it that way. `manga` is the title the
[source](../concepts/source.md) answered with (its `url` and `title`) when it equals an
AniList title or synonym once case, diacritics and punctuation are ignored; `manga: null`
means the source was searched and nothing matched exactly, never an approximate result.
The search tries the romaji title, then the English one. Values from before matching
(a bare source id) are ignored, so the user picks the source again. A missing key means no
source chosen; so does a match whose source no installed extension provides any more
(it was uninstalled), once the installed list has been read, so the detail asks to pick
a source again instead of failing to load chapters. Survives sign-out (it is not cleared) and does not sync anywhere.
