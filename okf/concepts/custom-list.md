---
type: Domain Concept
title: Custom list
description: A named group of manga already on the user's list — a label over the statuses, made and deleted in the app, kept by position on AniList.
tags: [tracking, list, custom-list]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-16T00:00:00Z }
---

A **custom list** is a name the user gives to a group of [list entries](list-entry.md).
It is a label, not a place: every manga in one is still filed under its
[list status](list-status.md), and a manga can be in any number of them. The app never
hides a manga from its status (AniList's `hiddenFromStatusLists`).

# On AniList

- The account's names live in `mediaListOptions.mangaList.customLists`, in the order
  they were saved. [UpdateMangaCustomLists](../operations/update-manga-custom-lists.md)
  replaces the whole array.
- An entry's `customLists` is a map of every name on the account to whether the entry
  is in it (`null` when the account has none).
  [SaveMangaTracking](../operations/save-manga-tracking.md) with `customLists`
  replaces the entry's lists; leaving it out keeps them.
- **Membership is kept by position, not by name.** Saving the names in another order,
  or without one in the middle, leaves each entry's lists at the same positions, now
  under other names: deleting the first of three lists moves the second's manga into
  the third. A deleted list's manga stay at its position too, and show up in the next
  list made there. So deleting a list saves again, after the names, every entry in it
  or in a later list, with its lists by name; a save clears the positions past the
  last name.
- A collection queried by status also returns the custom groups holding that status's
  entries; a list with no manga has no group.
- AniList accepts any name, blank ones and case variants included, with no length
  limit: the app refuses a blank name and one the account already has in any case.

# In the app

- **Seen** in the Manga tab's list picker after the six statuses, with how many manga
  each holds, and opened like a status (`?list=custom:<name>`). A link to a list the
  account no longer has opens Reading.
- **Filled** from the tracking sheet's Custom lists row: any number checked, saved with the
  rest of the entry. A save that doesn't change the lists leaves them alone. Offline the
  picked set is kept with the entry's other changes and sent later (see
  [Pending entries](../stores/pending-progress.md)).
- **Made, renamed and deleted** in Manage lists, only online: a change kept for later
  would land on positions that may have moved. A rename keeps its manga, since it
  stays at its position. Deleting one keeps its manga under their status; while its
  entries are saved again its row shows a loader, and another delete or rename waits. After each change the counts are read again, quietly: a new list can
  come back holding manga a list deleted elsewhere left at its position.
- AniList takes a name twice; the app shows it once but sends every name back as
  AniList has them, so the lists after a repeat don't move.
