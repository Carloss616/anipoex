---
type: Persisted Store
title: Search history
description: The AniList searches the user submitted, newest first, at most 10; suggested while typing on Home.
resource: ../../src/features/manga/state/search-history.ts
tags: [search, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-05T00:00:00Z }
---

Key `search-history`: a list of strings, newest first. Default empty.

- **Added** when a search is submitted ([MangaSearch](../operations/manga-search.md)),
  trimmed; blank text is never kept.
- **Once per text**: submitting a text already there, in any letter case, moves it to the
  front with the new spelling.
- **At most 10**: the oldest drops off.
- **Suggested** while typing on Home: the entries that contain the draft, ignoring case;
  none for an empty draft. *Clear* empties the list.
- Stays on the device; never sent to AniList.
