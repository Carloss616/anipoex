---
type: Product Overview
title: Anipoex — product overview
description: What the app does, the daily flow that keeps the user's list current, and the vocabulary the rest of the bundle assumes.
tags: [overview, vocabulary]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Anipoex is a manga tracker for one person: it signs in to [AniList](concepts/tracker.md),
shows the manga on their list, and lets them record how far they have read. AniList is
the record of truth; the app keeps no data of its own beyond a session, a
[cache](stores/apollo-cache.md) and a few preferences. It ships the same features on iOS
(SwiftUI), Android (Jetpack Compose) and web.

# The daily flow

1. **Sign in once.** AniList's implicit grant returns a one-year token, kept in the
   [session](stores/session.md). Every route but sign-in is behind it.
2. **Open the Manga tab.** It shows one [list status](concepts/list-status.md) at a
   time (Reading by default), loaded by [MangaList](operations/manga-list.md), with
   [per-status counts](metrics/list-counts.md) in the picker. Search and a genre filter
   narrow it on the device.
3. **Open a manga.** The [detail](operations/manga-detail.md) paints from the cache what
   the list already fetched and fills in the rest.
4. **Track it.** The tracking sheet edits the [list entry](concepts/list-entry.md):
   status, progress, score, start and finish dates. [Tracking rules](concepts/tracking-rules.md)
   fill the obvious side effects and show them before saving. Saving goes through
   [SaveMangaTracking](operations/save-manga-tracking.md), which also refetches the
   list and its counts.
5. **Pick where chapters come from.** Each manga remembers its [source](concepts/source.md);
   the [Extensions](concepts/extension.md) tab is where sources get installed. The
   detail then lists the [chapters](concepts/chapter.md) of the manga matched in that source.

# Vocabulary

| Term | Meaning |
|---|---|
| **Manga** / media | An AniList `Media` of type `MANGA`. Ours to read, AniList's to own. See [manga](concepts/manga.md). |
| **List entry** | The user's `MediaList` row for one manga: status, progress, score, dates. See [list entry](concepts/list-entry.md). |
| **List status** | Where the user filed the manga (Reading, Planning, …). Not the publication status. See [list status](concepts/list-status.md). |
| **Publication status** | How the manga itself is doing (Releasing, Finished, Hiatus, …). |
| **Progress** | Chapters read, an integer. Volumes are not tracked. |
| **Viewer** | The signed-in AniList user. See [viewer](concepts/viewer.md). |
| **Tracker** | The service that holds the list. Only AniList exists. See [tracker](concepts/tracker.md). |
| **Source** | A site chapters are read from. See [source](concepts/source.md). |
| **Extension** | A source as an installable package, with a version. See [extension](concepts/extension.md). |
