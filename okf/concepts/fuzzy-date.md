---
type: Domain Concept
title: Fuzzy date
description: AniList's year/month/day dates where any part may be null; the form needs all three, and a save sends only the dates the user changed.
tags: [tracking, dates]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

AniList stores `startedAt` / `completedAt` as a `FuzzyDate`: `{ year, month, day }`,
each part nullable, so "sometime in 2019" is `{ year: 2019 }`.

- **Reading**: the form only accepts a full date. A date missing any part reads as
  **unset**; a date picker has no day to point at.
- **Writing**: a save sends a date only when the user changed or cleared it. An
  untouched date is omitted, and AniList leaves an omitted date alone. A cleared date
  is sent as the explicit null triple `{ year: null, month: null, day: null }`, which
  is what erases a date on AniList.
- These are civil dates: built from local year/month/day, no time zone involved.

# Partial dates

A partial date set on AniList's website (year only, or year and month) shows as unset
in the sheet but **survives a save**: saving status, progress or score leaves it as it
is. Picking a date replaces it, and so does a [tracking rule](tracking-rules.md) that
fills an empty date, such as completing the entry. Removing it is the one thing the
sheet can't do: it reads as unset already, so there is nothing to clear. Until
2026-10-18 every save sent both dates and erased a partial one.
