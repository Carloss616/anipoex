---
type: Domain Concept
title: Fuzzy date
description: AniList's year/month/day dates where any part may be null; the form needs all three, and saving erases a partial one.
tags: [tracking, dates]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

AniList stores `startedAt` / `completedAt` as a `FuzzyDate`: `{ year, month, day }`,
each part nullable, so "sometime in 2019" is `{ year: 2019 }`.

- **Reading**: the form only accepts a full date. A date missing any part reads as
  **unset**; a date picker has no day to point at.
- **Writing**: an unset date is sent as the explicit null triple
  `{ year: null, month: null, day: null }`, which is what erases a date on AniList
  (an omitted argument would leave it alone).
- These are civil dates: built from local year/month/day, no time zone involved.

# Known loss

Because of the two rules above, **saving the sheet erases a partial date** that was set
on AniList's website (year only, or year and month). Not fixed as of 2026-10-18.
