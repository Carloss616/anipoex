---
type: Persisted Store
title: Pending progress
description: Reading progress made while AniList could not be reached, kept per manga until it is sent.
resource: ../../src/features/manga/state/pending-progress.ts
tags: [tracking, offline, persistence]
generated: { by: claude-code, at: 2026-11-16T00:00:00Z }
---

Key `pending-progress`: a record by AniList media id of the chapter progress, the status
that came with it, when it was written and the last send error. Default empty. Stays on
the device; it is not synced.

- **Higher wins**: a lower progress never replaces the kept one; a progress that is not
  lower also takes its status.
- **Kept by the reader**: a chapter's save that fails for want of a connection lands
  here, with a notice that it will be sent when online; other failures don't.
- **Shown progress** is the higher of AniList's and the pending one: chapters read and
  Continue count it.
- **Sent later**, while signed in: at launch, when the app comes back to the
  foreground, and a moment after any answer from AniList. Each entry goes in turn, with
  the [tracking rules](../concepts/tracking-rules.md) of that progress applied to the
  entry; with no cached entry only progress and status go. One AniList already reached
  (read on another device) is dropped without sending, so progress never goes down.
- **Offline**: a dropped connection keeps the entry and stops the run. Any other failure
  keeps it with the error message and goes on to the next.
- **Turned down**: an entry with an error is not sent again until Retry clears it, or
  the reader keeps progress for that manga again. Activity lists these under "Progress not sent", with
  Retry and Discard.
