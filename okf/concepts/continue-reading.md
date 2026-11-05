---
type: Domain Concept
title: Continue reading
description: Home's section of started mangas whose chosen source has chapters past the user's progress.
resource: ../../src/features/home/utils/continue-items.ts
tags: [home, sources, chapters]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-05T00:00:00Z }
---

**Continue reading** is the Home section of mangas the user can go on reading now. It
is built on the device, not asked of AniList. A manga shows when all of these hold:

1. It has a [chosen source](../stores/source-matches.md) with a match, and that source's
   [stored chapters](../stores/source-chapters.md) are for the matched page (a list stored
   for a page the match pointed to before doesn't count).
2. It has a [list entry](list-entry.md) with progress above 0.
3. At least one stored chapter is past that progress.

Items are sorted by their newest chapter's upload date, newest first. Each shows how many
stored chapters are past the progress (counted over the list, unlike a probe's
[unread chapters](../metrics/unread-chapters.md)), and tapping it opens the reader at the
first unread [chapter](chapter.md): the lowest unread number.

## Where it comes from

- The mangas: every one with a chosen source.
- Their progress: AniList, through the `ContinueMedia` query for those mangas, read
  from the [Apollo cache](../stores/apollo-cache.md) when the list already loaded them.
- Their chapters: the stored chapter list of the chosen source, read from the device.

## How fresh it is

Only as fresh as the stored lists: the last time the manga's detail loaded its chapters
or a scan probed its sources. Nothing refreshes them in the background, so a release
the user hasn't opened the manga or scanned since doesn't show yet.
