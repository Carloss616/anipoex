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
| Completed | Progress ← the manga's `chapters` (when known); start and finish dates ← today, if empty. |
| Anything else, coming **from** Completed | Finish date cleared (it was stamped by Completed). Progress stays: there is nothing to restore it from. |

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
offers Undo once it has.
