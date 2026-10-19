---
type: Domain Concept
title: Chapter
description: A chapter row on the manga detail screen, read from the matched manga in the chosen source.
tags: [reading, sources]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-18T00:00:00Z }
---

A **chapter** row has an `id` (the chapter's url in the source), a `number`, a `title`
(the source's chapter name) and a release `date` (empty when the source gives none).
The detail lists the chapters of the manga [matched](../stores/manga-source.md) in the
chosen [source](source.md), in the order the source answers; nothing is stored, they
are fetched when the match changes and on refresh.

- **Number**: the source's own; when it gives none (`-1`) it is read from the name
  ("Ch.4", "Chapter 12.5", "Vol.2 Ch.10"). With neither, the number stays `-1` and the
  row is never dimmed as read.
- **Read**: a row whose number is below the [list entry](list-entry.md)'s progress is
  dimmed.
- **Total**: the manga's `chapters` count; when AniList has none, the number of rows listed.
- **Empty states**: no source picked asks to pick one; a manga the source doesn't have
  says so ("No match"); a failed load shows the error; a source that answers with no
  chapters says none are available. While the source is searched or the chapters load,
  a loader shows instead.

Chapter numbers are what [list entry](list-entry.md) progress counts.
