---
type: Persisted Store
title: Sync state
description: What this device last pushed, when it last synced and why the last sync failed.
resource: ../../src/features/sync/state/engine.ts
tags: [sync, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-15T00:00:00Z }
---

Key `sync-state`: `{ pushed: { [table]: hash }, lastSync?, error? }`.

- `pushed`: per synced table, a hash of the file this device last wrote. A sync writes only
  the files whose content changed since, plus any of this device's files the target no
  longer has (a new gist gets them all on the first sync).
- `lastSync`: when the last sync finished, in epoch ms.
- `error`: what the last sync failed with; the next one that lands clears it.

A sync reads every device's files for each table, merges them with this device's
[stamped records](sync-meta.md), writes what won into the stores, then writes this
device's files. What it writes into the stores is not stamped again, so it doesn't bounce
back as a change of its own. Syncs never overlap: one asked for while another runs happens
right after it, once. They run on launch, when the app comes to the foreground, every 5
minutes in the foreground, 3 seconds after a change to a synced store, and on the web when
the browser is back online. A failure keeps everything for the next one: nothing counts as
pushed until the target took it.
