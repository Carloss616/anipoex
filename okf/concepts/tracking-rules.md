---
type: Business Rule
title: Tracking rules
description: The side effects a status or progress change applies to a list entry, shown by the sheet before saving and by the reader as soon as it saves.
tags: [tracking, rules]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
verified: { by: human:carlos-espinoza, at: 2026-10-18T00:00:00Z }
---

The tracking sheet edits a form copy of the [list entry](list-entry.md). Two edits
carry side effects; "today" is the device's local date.

# Changing the status

| New status | Effect |
|---|---|
| Reading | Start date ← today, if empty. |
| Completed | Progress ← the manga's `chapters` (when known); start and finish dates, if empty, from when the reading happened (below), else today. |
| Anything else, coming **from** Completed | Finish date cleared (it was stamped by Completed). Progress stays: there is nothing to restore it from. |

## Dating a Completed

A manga is often marked Completed long after its last chapter was read: some sources stop
a chapter short of AniList's count (120 of 121), so it never reached Completed by itself.
Completing it in the sheet, by choosing Completed or by raising progress to the last chapter,
reads the viewer's [list activity](../operations/manga-read-dates.md) for the manga and dates
it from there:

- **Finish date**: the day of the newest activity with chapters read.
- **Start date**: the day of the first activity with chapters read, only when it starts at
  chapter 1; a first read further in (activity began mid-series) gives none.
- Reads from before an earlier Completed belong to that one: when the newest is older than
  it, there is no finish date. A reread never gets a start: the entry is Rereading, has a
  repeat count, or an earlier Completed shows in the activity.
- Raising progress fills only the finish date; its start keeps the rule below. Raising it
  to the last chapter right after reading that chapter elsewhere dates the finish by the
  chapter before, the last one AniList saw: the preview shows it, and it can be changed.
- A finish date from activity with no start leaves the start empty: today would put it after
  the finish. With no activity at all, both fall back to today as before.

Days are the device's local calendar days. OK waits for the activity when the change
completes the entry, so it can't save today's date while it loads. The reader's own Completed (reaching the last chapter) still
uses today: that is when it was read.

# Changing the progress

- Clamped to `0 … chapters` (no upper bound when `chapters` is null).
- **From 0 to more than 0**: start date ← today, if empty. Further in, an empty start
  date stays empty: the real day is unknown and today would invent one.
- **Reaching `chapters`** while Reading or Planning: status → Completed, finish date
  ← today if empty. Paused or Dropped keep their status: the user is correcting a number.

# Showing it

Before confirming, the sheet lists every field a rule is about to change except the
one being edited ("Status → Completed", "Finish date cleared", …), so nothing changes
behind the user's back.

# Reading a chapter

Reaching the end of a chapter in the reader sets progress to the chapter's whole number
when that is higher, with the progress rules above; a manga not in the list is added (as
Reading, or Completed at its last chapter) only after the user confirms. The reader lists
the changed fields like the sheet does as soon as the save starts, not when it lands, and
offers Undo once it has. Without a connection the progress waits on the device as
[pending progress](../stores/pending-progress.md), and these rules apply when it is sent.
