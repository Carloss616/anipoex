---
type: Persisted Store
title: Settings
description: Every setting in one table, so it can travel as one object; the device's own values kept apart.
resource: ../../src/state/settings/
tags: [preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-09T00:00:00Z }
---

Key `settings`, one object:

| Section | Holds | Page |
|---|---|---|
| `version` | `0` until the older tables were moved in, then `1` | |
| `theme` | family and light / dark / system preference | [Theme](theme.md) |
| `home` | Home's sections and their order | [Home layout](home-layout.md) |
| `mangaList` | grid density and title position | [Manga list view](manga-list-view.md) |
| `extensions.repos` | the repos extensions come from | [Extension repos](extension-repos.md) |
| `sources` | `autoPick` (on by default), `languages`, the user's order, and `slowSkip`, the seconds a Reading scan waits on a source before skipping it (60 by default, 0 never skips); edited in Settings → Sources | [Source](../concepts/source.md) |
| `device` | values that belong to this device only, never synced: the extension DNS, `id` (a random name for this device's sync files, made on first launch) `folder`, the folder it syncs through (on iOS its name and bookmark), and `syncInterval`, the minutes between syncs while the app is open (0: none) ([sync state](sync-state.md)), `downloadsIn` (`sync`, `folder` or `device`: where chapter downloads go; `sync` follows `folder`) and `downloadsFolder` (the folder used when `downloadsIn` is `folder`, in the format of `folder`) ([downloads](downloads.md)), and `mangaList`, the manga list's filters (`unread`, `started`, `downloaded`, `completed`, each `any`, `include` or `exclude`) and sort (`by` one of `title`, `unread`, `chapters`, `updated`, `added`, `score`; `ascending`), absent until the user changes something and kept per device because what is unread or downloaded differs by device ([Manga list view](manga-list-view.md)) | [Sync stamps](sync-meta.md) |

Per-item data (chosen sources, probes, exclusions, chapters, search history) and the
session keep their own tables: they grow with use, and the session is the account's.

A value saved by another build is read leniently: each section a stored value lacks, or
holds something unreadable, takes its default.

**Moving in**: before `settings` existed, each section had its own table (`theme`,
`home-layout`, `manga-list-view`, `extension-repos`). The first launch with a `version`
of `0` copies what those held, sets `version` to `1` and deletes them, so it runs once; a
fresh install just starts on the defaults.
