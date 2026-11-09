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
| `sources` | `autoPick` (on by default) and `languages`, the user's order; edited in Settings → Sources | [Source](../concepts/source.md) |
| `device` | values that belong to this device only, never synced | |

Per-item data (chosen sources, probes, exclusions, chapters, search history) and the
session keep their own tables: they grow with use, and the session is the account's.

A value saved by another build is read leniently: each section a stored value lacks, or
holds something unreadable, takes its default.

**Moving in**: before `settings` existed, each section had its own table (`theme`,
`home-layout`, `manga-list-view`, `extension-repos`). The first launch with a `version`
of `0` copies what those held, sets `version` to `1` and deletes them, so it runs once; a
fresh install just starts on the defaults.
