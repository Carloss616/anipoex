---
type: Domain Concept
title: Manga
description: An AniList media of type MANGA — titles, synonyms, cover, genres, publication status and chapter total — owned by AniList, only read here.
tags: [manga, anilist, media]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

A **manga** is an AniList `Media` with `type: MANGA`, identified by its AniList `id`.
The app never writes it; it reads two shapes of it:

- **List shape** (`MangaMedia` fragment): titles, synonyms, cover, genres, publication
  status, `chapters`, plus the entry's `id` and `progress`. Enough for a card.
- **Detail shape** (`MangaDetail` fragment): the list shape plus description, banner,
  `averageScore`, start year, up to 6 staff by relevance, and the full
  [list entry](list-entry.md).

# Fields that need care

- **`chapters` is often null** for releasing series: AniList fills it when the run
  ends. Everything that divides by it handles null (see
  [reading progress](../metrics/reading-progress.md)).
- **Titles**: `userPreferred` is what's shown; `english`, `romaji`, `native` and
  every synonym are matched by the list search.
- **`status`** is the *publication* status (Releasing, Finished, Hiatus, Not yet
  released, Cancelled), unrelated to the [list status](list-status.md).
- **`description`** is light HTML. It is flattened to plain text (`<br>` to newlines,
  tags dropped, five entities decoded); anything richer degrades to text.
- **Author** is derived, not a field: the first staff edge whose role mentions
  "story", else the first credited staff, so an artist listed first is not billed as
  the author.
- **`coverImage.color`** is AniList's dominant colour, used as the tint behind the cover.

An unknown id yields no media, and the detail shows nothing rather than an empty page.
