---
type: Domain Concept
title: Source
description: A source of an installed extension, in any language; each manga remembers the one picked for it.
tags: [sources, reading]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

A **source** is a site the app reads chapters from, as exposed by an installed
[extension](extension.md): `id` (the source's own id; one extension can have several sources), `name`, and `initials`. Its
tile shows the source's **logo** when it has one, else (or while the logo loads, or if it
fails) the initials. The logo is the icon of the installed APK (a local file, so it
shows offline), cut to its opaque body without the launcher's padding, shadow or mask so
it fills the tile edge to edge; an extension not installed yet shows the icon its repo lists, as
the repo draws it. The tile's colour, shown only behind the initials, is hashed from the name, so it
is stable across launches.

- **Per manga**: the detail's source picker stores the choice keyed by the manga's
  AniList id (see [chosen source](../stores/source-matches.md)). No choice shows "Source".
- **Available or excluded**: per manga, a source is **available** or **excluded** (see
  [source exclusion](source-exclusion.md)). Available sources are listed furthest-ahead
  first (latest chapter descending, ties by name); sources with suspicious numbering come
  after them, and unscanned / unmatched last. Excluded ones are listed by name, with their
  reason and `auto` / `you`. The order is set when the sheet opens and never changes while it
  stays open, even through a scan: a rescan updates the row in place, and a source that
  joins the list mid-session is added at the end. So a first scan sorts on the next open.
- **Status**: each available source shows the status from
  [unread chapters](../metrics/unread-chapters.md), from its [probe](source-probe.md)
  ([stored](../stores/source-probes.md); [exclusions](../stores/source-exclusions.md) and
  [pins](../stores/source-pins.md) too). The header reads `Read c.{n}` / `Not started`, from
  the live progress, so finishing a chapter in the reader shows there (and in every `+N`)
  without a rescan.
- **Which show**: every source of every installed extension, in any language; installing
  an extension is the choice. There is no language filter or setting.
- **Names**: when an extension has more than one source, each name carries its language
  (`Source (ES-419)`); with one, just the name. Nothing installed, nothing listed.
  In the source sheet the name goes without it, and every row shows the language as its
  first badge (`EN`, `ES-419`, `ALL`), before the status.
- **Empty sheet**: with no search, the source sheet says why nothing is listed: in
  the web app in a browser "Sources run in the Android, iOS and desktop apps"; on Android, iOS (sideload) and desktop, "No sources installed", pointing to
  the Extensions tab. A search with no hits says
  "No sources found". In the web app in a browser the detail's "Pick a source" says extensions run in the
  Android, iOS and desktop apps.

- **Search by hand**: when matching by title finds nothing or the wrong manga, a source can
  be searched with the user's own title. "Search on <source>" (in any row's menu, on iOS also
  among the row's right-edge swipe actions, and in the detail's *No match* state, beside
  "Choose another source") opens the list with that source searching; the header's
  search-titles toggle searches every source,
  excluded ones too. While any source searches, the list's search field holds the title (the
  romaji title at first; a new title is searched on submit) and each searching source shows its
  results under its row as cover cards, first page first, the next page loading as the end comes
  into view. The source's current match comes first, marked in the cover's corner. Tapping a card
  opens its menu: its full title, *Use as match* (or *Remove match* on a match set by hand), and
  *Open website*; a match changes only from that menu. A match is kept as a
  [manual match](../stores/manual-matches.md) and the list stays open; a failed or empty search
  says so beside the current match. Closing the list or the search-titles toggle ends the
  search; nothing searched is stored.
- **Website**: an installed source reports its own site (none when it can't). On Android, the
  detail shows an "Open on <source>" button next to the source picker once the manga has a
  match; it opens the manga's page on that source's site, or says it couldn't.

Sources come only from [extensions](extension.md); the app ships none of its own.
