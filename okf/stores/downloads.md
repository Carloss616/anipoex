---
type: Persisted Store
title: Downloads
description: The chapters waiting to be downloaded, and the CBZ files that make a chapter readable offline.
resource: ../../src/features/downloads/
tags: [downloads, offline, persistence]
generated: { by: claude-code, at: 2026-11-16T00:00:00Z }
---

Key `download-queue`: a record by `anilistId/sourceId/hash` of a chapter waiting to be
downloaded: the manga (id, title, cover), the source (id, name), the chapter (url, name,
number, scanlator, memo), its place in the queue, its `state` and the last error. Default
empty. Stays on the device; it is not synced.

- **States**: `queued`, `running` (one chapter at a time per source, sources in
  parallel) and `failed`, which waits for Retry, one by one or all at once. A finished
  chapter leaves the queue.
- **Survives restarts**: at launch a chapter left `running` goes back to `queued`, its
  half-made files dropped, and the queue goes on.
- **Paused by the user**: key `downloads-paused` (`{ byUser }`, default not paused, not
  synced) keeps the user's pause across restarts until Resume. When iOS's background time
  runs out the queue pauses too, but only until the app is back: if iOS ends the app
  meanwhile, the next launch downloads again.
- **Not downloaded twice**: a chapter already queued or downloaded is not added again.
- **Not in a browser**: downloads need the extension runtime, so the web app hides them.

# In memory only

What is downloaded (by manga and source, each chapter `local` or `cloud` when its file is
a placeholder the sync app has not fetched yet) and each running chapter's progress are
read from the files and rebuilt at launch; they are not persisted.

# Where the files live

The root comes from [settings](settings.md) `device.downloadsIn`:

| Value | Root |
|---|---|
| `sync` (default) | `downloads/` beside `sync/` in the [sync folder](sync-state.md); the app's own storage when this device has none |
| `folder` | `downloads/` in `device.downloadsFolder` |
| `device` | the app's own storage |

```
downloads/<Title> [anilistId]/<Source> [sourceId]/<Chapter> [hash].cbz
```

`hash` is the FNV-1a of the chapter's URL as 8 hex digits, so a renamed chapter is still
the same file. Each name is stripped of characters a file system or cloud refuses and
cut to 120 characters.

- **One CBZ per chapter**: the pages as the source's client fetched them, stored without
  recompressing, in reading order, plus a `ComicInfo.xml`.
- **Deleted only by hand**: from a chapter's menu. The app never deletes a file on its
  own in a folder the user picked.
- **Changing the root moves the downloads**: each file is copied into the new root and
  removed from the old one only once the new has it. A path the new root already holds is
  skipped and kept, since two strings can name one folder and removing it would delete
  the only copy. Only files in the app's own layout move (a folder and a file each named
  with their id): on a disk that ignores case, a root's own `Downloads` folder is
  `downloads/`, and the user's files there stay. One move runs at a time.
- **Reading**: the reader opens a chapter from the current root, then the device's own
  storage, and unpacks it to a cache of the last 3 chapters read.
