---
type: Domain Concept
title: Source
description: A source of an installed extension, in a language the picker shows; each manga remembers the one picked for it.
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
  AniList id (see [chosen source](../stores/manga-source.md)). No choice shows "Source".
- **Which show**: only sources in the languages `all`, `en` and the device's own
  (`es-MX` shows `es`; a regional `es-419` counts as `es`). There is no setting for it.
- **Names**: when an extension keeps more than one source in view, each name carries
  its language (`Example (ES-419)`); with one, just the name. Nothing installed, nothing listed.
- **Empty sheet**: with no search, the source sheet says why nothing is listed: on iOS and
  web "Sources run on Android only for now"; on Android, "No sources installed", pointing to
  the Extensions tab (also when none is in a shown language). A search with no hits says
  "No sources found". On iOS and web the detail's "Pick a source" says extensions run on
  Android only.

- **Website**: an installed source reports its own site (none when it can't). On Android, the
  detail shows an "Open on <source>" button next to the source picker once the manga has a
  match; it opens the manga's page on that source's site, or says it couldn't.

Sources come only from [extensions](extension.md); the app ships none of its own.
