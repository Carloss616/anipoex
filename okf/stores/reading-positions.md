---
type: Persisted Store
title: Reading positions
description: Per manga, the chapter being read and the page on screen, kept until that chapter is read; synced so any device continues there.
resource: ../../src/features/manga/state/reading-positions.ts
tags: [reader, chapters, sync, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-11-18T00:00:00Z }
---

Key `reading-positions`: `{ [anilistId]: { sourceId, chapterId, number, scanlator, page,
pages, offset, readAt } }`. `chapterId` is the chapter's url in that source, `page` the
first page on screen (from 1) of `pages`, `offset` how far down that page (0–1), `readAt`
epoch ms.

**Not a history**: at most one record per manga, for the chapter being read. Opening
another chapter replaces it.

- **Written** by the reader once the page stays put for a moment, when the reader closes
  and when the app goes to the background. A chapter that reached its end isn't written
  again in that reader.
- **Removed** once its chapter is read:
  - reaching the chapter's end, when its progress is saved or kept to send later, when
    there was nothing to save (a re-read), or when the manga isn't on the list (Undo
    on the end notice puts the record back);
  - whenever the manga's [list entry](../concepts/list-entry.md) progress is at or above
    its chapter number, from any device or app (on the detail and in each sync, with the
    progress in the [Apollo cache](apollo-cache.md));
  - for a manga not on the list, when it sits on its chapter's last page.

  A chapter without a number is only removed by reaching its end.
- **Read** against the [chosen source](source-matches.md) as it is now:

  | Saved | Opens |
  |---|---|
  | Same source and chapter url | That chapter, at the page and offset |
  | Another source, or a url the source changed | The chapter with the same number (the same scanlator first), at page 1 |
  | No chapter with that number | The usual Continue chapter; the record stays |

  Only the first case shows "Page N of M" on the chapter's row; the [Continue reading](../concepts/continue-reading.md)
  action and Home open that chapter.

Synced as the table `reading-positions`, one record per manga ([Sync stamps](sync-meta.md)).
A removal's tombstone is dropped after a day, not 90: a device that comes back later can
bring the record back, and the sync's progress check removes it again.
