---
type: Domain Concept
title: Chapter
description: A chapter row on the manga detail screen, read from the matched manga in the chosen source.
tags: [reading, sources]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-18T00:00:00Z }
---

A **chapter** row has an `id` (the chapter's url in the source), a `number`, a `title`
(the source's chapter name), a release `date` (empty when the source gives none) and
the `scanlator` that translated it (none when the source doesn't say). A source may also
keep its own data on the chapter (its *memo*, never shown); opening the chapter hands it
back to the source, which may need it to find the pages.
The detail lists the chapters of the manga [matched](../stores/manga-source.md) in the
chosen [source](source.md), in the order the source answers; nothing is stored, they
are fetched when the match changes and on refresh.

- **Number**: the source's own; when it gives none (`-1`, or any lower number but -2) it is read the way
  [Mihon reads it](https://github.com/mihonapp/mihon/blob/main/domain/src/main/java/tachiyomi/domain/chapter/service/ChapterRecognition.kt)
  today, over the whole chapter list, so a source shows the same numbers in both apps:
  - each name, without the manga title, gives the number after "ch." or else the first
    one, ignoring volume, season and version markers ("Capítulo 51" is 51, "Vol.2 Ch.10"
    is 10); extra adds .99, omake .98 and special .97, and a letter a–i or a part up to
    Part IX adds tenths only when the number has no decimals (19a and "Chapter 12 Part 3" are 19.1
    and 12.3, but 1.5a stays 1.5);
  - a number shared by every name in a group of at least three that differ only in their
    numbers is ignored (the 2 of "Group 2 Chapter 386"), unless it follows a chapter or
    episode word ("ch", "chap", "chapter", "ep", "episode", with or without a dot) or "#";
    a chapter url the source repeats counts once, as its first occurrence;
  - a row with no number between two numbered ones within the same volume fills the gap
    (2, ?, 4 gives 3; 10, Bonus, 11 gives 10.5); after the newest chapter only bonus rows
    are numbered (100, Afterword gives 100.5); before the oldest only a prologue, as 0.

  A negative number the source gives on purpose (like -2) is kept. With no number at all
  the row stays `-1`; a row with a negative number is never dimmed as read.
- **Read**: a row whose number is at or below the [list entry](list-entry.md)'s
  progress (AniList progress counts the last chapter read) is dimmed; with progress 0
  nothing is read.
- **Total**: the manga's `chapters` count; when AniList has none, the number of rows listed.
- **Empty states**: no source picked asks to pick one; a manga the source doesn't have
  says so ("No match"); a failed load shows the error (a source that doesn't answer in
  30 s has failed); a source that answers with no chapters says none are available. While
  the source is searched or the chapters load, a loader shows instead.

Chapter numbers are what [list entry](list-entry.md) progress counts.
