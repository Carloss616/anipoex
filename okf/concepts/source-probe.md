---
type: Domain Concept
title: Source probe
description: What one scan learned about one source for one manga, and the five outcomes it is classified into.
resource: ../../src/features/manga/utils/source-probe.ts
tags: [sources, probes]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

A **probe** is what one scan learned about one [source](source.md) for one manga: its
latest chapter, chapter count, whether it matched, whether it errored, and when it was
checked. Its fields match the record of the
[manga-source-updates plugin](https://github.com/Carloss616/seanime-extensions/tree/main/src/plugins/manga-source-updates),
so a probe can sync through its gist later.

## How a probe reads

The source is searched for the manga by equal title, the same way picking a source
matches (see [chosen source](../stores/manga-source.md)); then its
[chapters](chapter.md) are read. The latest chapter is the highest chapter number,
ignoring unnumbered rows. No equal title, or no chapters, is *no match*; a failure or a
30 s timeout is *error*.

## The five outcomes

In order, the first rule that holds wins:

1. errored: *error*
2. no chapters: *no match*
3. `read > 0` and `read − latest ≥ 10`: *outdated* (the far-behind gap, 10 as in the plugin)
4. unread chapters above 0 (see [unread chapters](../metrics/unread-chapters.md)): *new*
5. otherwise: *up to date*

*Error*, *no match* and *outdated* are the bad outcomes that [auto-exclusion](source-exclusion.md) acts on.
