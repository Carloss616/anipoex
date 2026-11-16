---
type: Persisted Store
title: Sync state
description: What this device last pushed, when it last synced and why the last sync failed.
resource: ../../src/features/sync/state/engine.ts
tags: [sync, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-15T00:00:00Z }
---

Key `sync-state`: `{ targets: { gist?, folder? }, devices }`, each target
`{ pushed: { [table]: hash }, lastSync?, error?: { kind, message } }`.

A device syncs with every target it has: the [GitHub gist](github-account.md), a folder
(below), or both, one after the other, each with its own state. Stopping a target forgets
its state; `devices` is everyone seen on any of them.

- `pushed`: per target and synced table, a hash of the file this device last wrote. A sync writes only
  the files whose content changed since, plus any of this device's files the target no
  longer has (a new gist or an empty folder gets them all on the first sync).
- `lastSync`: when the last sync finished, in epoch ms.
- `error`: what the last sync failed with, and its kind: `offline` (GitHub couldn't be
  reached), `auth` (the token was revoked) or `other`; the next sync that lands clears it.

A sync reads every device's files for each table, merges them with this device's
[stamped records](sync-meta.md), writes what won into the stores, then writes this
device's files. What it writes into the stores is not stamped again, so it doesn't bounce
back as a change of its own. Syncs never overlap: one asked for while another runs happens
right after it, once. They run on launch, when the app comes to the foreground, every few
minutes while it's open (each device picks 1, 5 or 15, or none; 5 until it picks), 3 seconds
after a change to a synced store (at most once a minute while changes keep coming, as in a
scan), on the web when the
browser is back online, and on desktop a second after a sync file in the folder changes. A failure keeps everything for the next one: nothing counts as
pushed until the target took it. GitHub limits writes per user, across every device: when it
asks to wait, the gist isn't tried again until the time it gives (a few minutes when it gives
none), and a folder keeps syncing meanwhile.

## Folder

A folder another program keeps in sync between devices (iCloud Drive, OneDrive, Syncthing)
holds the same files as the gist, in its `sync/` subfolder: the folder also holds what isn't
synced as data (chapter [downloads](downloads.md) go in `downloads/`, beside `sync/`, and are never synced as records). On desktop the user picks it in a dialog and the app
watches it; only `anipoex-*.json` files are read or written there, each written whole
through a temporary file. On Android it is picked with the system's folder picker, whose
permission persists; Drive and OneDrive don't sync folders there, so a separate sync app
keeps it in sync, and the app reads it on the usual triggers (Android can't watch it). Each
file is replaced by a new one on write, since some providers don't shorten a rewritten
file. On Android and iOS a sync reads again only the files whose modified time or size
changed since it last read them. On iOS it is picked with the Files picker (iCloud Drive, OneDrive, Google Drive), and a
bookmark iOS gives for it keeps the access across launches; reads wait for iCloud to
download a file, and, as on Android, the folder is read on the usual triggers. A plain
browser doesn't offer folders. The folder is kept per device in
[settings](settings.md) `device.folder`. Stopping takes this device's files out of it the
same way disconnecting the gist does: only when another device's files carry every record.
