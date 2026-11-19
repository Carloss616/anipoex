---
type: Persisted Store
title: Pending entries
description: Changes to list entries made while AniList could not be reached, kept per manga until they are sent.
resource: ../../src/features/manga/state/pending-entries.ts
tags: [tracking, offline, persistence]
generated: { by: claude-code, at: 2026-11-16T00:00:00Z }
---

Key `pending-progress` (the name it had when it only held reading progress): a record by
AniList media id of what was changed on that manga's entry while [offline](../concepts/offline.md)
and not sent yet. One record holds, any of:

- the reader's **progress**, and the status that came with it (kept but not sent: the
  rules set the status when it is sent);
- **hand edits**: the fields of the tracking sheet the user changed (status, progress,
  score, dates, custom lists), only those; the lists as the whole set picked;
- a **removal** from the list;
- the AniList entry it changes (none for a manga **added offline**), what the cache showed
  before the first change (to put back), when it was written and the last send error.

Default empty. Stays on the device; it is not synced.

- **Kept offline**: a save that fails for want of a connection lands here, from the
  reader or from the tracking sheet, with a notice that it will be sent. Other failures
  don't. With no connection the sheet doesn't try: it keeps the change at once.
- **Shown at once**: a kept edit, removal or read is written to the cache, so the entry,
  its list, the counts and the unread badges show it before it is sent. Shown progress is the higher of
  AniList's and the pending one; a progress set by hand is shown as it is.
- **Reader's progress**: the higher wins, and a lower one never replaces the kept one.
  Over a progress set by hand it only raises that one. Reading a manga queued for removal
  cancels the removal.
- **Hand edits** merge over earlier ones, field by field. A progress set by hand replaces
  the reader's.
- **Removal**: drops whatever was queued for the manga; the entry stays in the cache to
  be put back.
- **Added offline**: a manga with no entry gets one with a status (Reading if the form
  had none) and keeps the form until sent.
- **Added again after a removal**: the edits start from a fresh entry (progress 0,
  score 0, no dates), so the removed entry's fields don't carry over.
- **Undo**: the reader's notice for a kept save says "Saved on this device" and offers
  Undo, which puts back what that manga held before the keep (an earlier entry, or none)
  without calling AniList. If the entry was sent, changed or discarded since, Undo leaves
  it alone.
- **Sent later**, while signed in and online: at launch, when the app comes back to the
  foreground, when the connection returns and a moment after any answer from AniList.
  Each entry goes in turn, over AniList's entry as it is now, never a copy saved on the
  device, so a change made elsewhere stays:
  - edited fields win and the rest keep AniList's values;
  - kept custom lists go out without any the account no longer has;
  - the reader's progress is sent only past AniList's, with the
    [tracking rules](../concepts/tracking-rules.md), which set the status: a pause made
    elsewhere stays;
  - nothing is sent when AniList already has it, so progress never goes down;
  - a removal deletes the entry; if it is already gone, nothing is sent;
  - an entry deleted elsewhere drops the edits, unless it was added offline, which is
    created again.
- **During a send**: what the user writes meanwhile stays for the next run; only the
  entry that was sent is cleared.
- **Offline**: a dropped connection keeps the entry and stops the run. Any other failure
  keeps it with the error message and goes on to the next.
- **Turned down**: an entry with an error is not sent again until Retry clears it, or
  the user changes that manga again. Settings › Activity (To send) lists these under "Not sent",
  with Retry and Discard.
- **Discard** drops the entry and puts the cache back to what it showed before the first
  change.
- **Signing out** empties it: the next account must not receive this one's changes.
