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
- **Shown progress** is the higher of AniList's and the pending one.
- **Sent later**: each entry goes to AniList in turn. One AniList already reached (read
  on another device) is dropped without sending, so progress never goes down.
- **Offline**: a dropped connection keeps the entry and stops the run. Any other failure
  keeps it with the error message and goes on to the next.
