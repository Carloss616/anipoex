---
type: Domain Concept
title: Source
description: A source of an installed extension, in your languages; each manga remembers the one picked for it.
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
  after them, and unscanned / unmatched last (so before any scan, by name). Excluded ones are
  listed by reason, behind first, then not matched, then failing, then excluded by hand, and by
  name within each, with their reason and `auto` / `you`. The order is live: a source moves when
  its probe lands or its exclusion changes, so a scan sorts the list as it goes. While a search by
  title runs, each section puts the sources with results first, then those still searching, then
  those with none or a failed search, then those not searched, each group in that order; a source
  moves only when its search ends.
- **Status**: each available source shows the status from
  [unread chapters](../metrics/unread-chapters.md), from its [probe](source-probe.md)
  ([stored](../stores/source-probes.md); [exclusions](../stores/source-exclusions.md) and
  [pins](../stores/source-pins.md) too). The header reads `Read c.{n}` / `Not started`, from
  the live progress, so finishing a chapter in the reader shows there (and in every `+N`)
  without a rescan; while Scan all runs it reads `Scanning {done} of {total}` over a progress
  bar instead, on every platform.
- **Which show**: every source of every single-language extension. A multi-language
  extension (its sources span several languages, or one covers all of them) offers only
  the languages of the installed single-language extensions, by base language (an `es-419`
  extension brings in a multi's `es` and `es-419`), plus its all-languages source; installing
  an extension in a new language adds it to every multi one. With only multi extensions
  installed, nothing is hidden. A source already chosen for a manga stays listed for it, and
  keeps its continue button and `+N`, even when its language is hidden.
- **Language order**: Settings lists the installed single-language extensions' languages,
  the device's language first and the rest alphabetically until the user reorders them; a
  newly installed language goes last. Sources tied on new chapters rank by it.
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
  "Choose another source") opens the list with that source searching. The header's
  search-titles menu searches a preset: the **unmatched** sources (available ones whose last
  probe found no match, and those excluded for no match; failing ones keep their Retry), the
  **excluded** ones, or **all**, each with how many sources it adds. Every search joins one set
  that only grows: a preset adds the sources not searching yet and leaves the others' results,
  and once any source searches the menu offers the presets that still add some, and *Stop
  searching*. The Excluded section's own action adds its sources the same way, and stops them
  once all of them search. While any source searches, the list's search field holds the title (the
  romaji title at first; a new title is searched on submit) and each searching source shows its
  results under its row as cover cards, first page first, the next page loading as the end comes
  into view. The source's current match comes first, marked in the cover's corner (a different
  mark when it was taken by title, below). With no match, the result whose title is closest to
  the manga's is marked as a suggestion; it is never taken. Tapping a card
  opens its menu: its full title, *Use as match* (or *Remove match* on a match set by hand), and
  *Open website*. A match is kept as a
  [manual match](../stores/manual-matches.md); the list stays open and that source's search
  ends. A failed or empty search
  says so beside the current match.
- **Taken by title**: results are read the way a scan reads them, with the titles the manga's
  manual matches taught (see [source matches](../stores/source-matches.md)). When a page lands, a
  source with no match of its own takes a result equal to a known title. When the user picks a
  match, every other source whose loaded results hold one equal to the new title takes it at
  once, without searching again, and reads its chapters, and its search ends (the other rows keep
  theirs); a toast says how many, with *Undo*.
  Undo, or *Remove match* on one of those, drops it and leaves the source unmatched without
  searching again, since a search would take the same page back, and that page isn't taken again
  until the app restarts. A chosen source stays chosen, with no match. Closing the list or *Stop
  searching* ends the search; nothing searched is stored.
- **Website**: an installed source reports its own site (none when it can't). On Android, the
  detail shows an "Open on <source>" button next to the source picker once the manga has a
  match; it opens the manga's page on that source's site, or says it couldn't.

Sources come only from [extensions](extension.md); the app ships none of its own.
