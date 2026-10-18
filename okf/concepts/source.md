---
type: Domain Concept
title: Source
description: A site chapters are read from; each manga remembers the one picked for it. Scaffolding — the list is mocked.
tags: [sources, reading, scaffolding]
status: draft
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

A **source** is a site the app reads chapters from: `id` (stable slug, e.g.
`example`), `name`, and `initials` drawn on its tile until sources carry icons. The
tile's colour is hashed from the name, so it is stable across launches.

- **Per manga**: the detail's source picker stores the choice keyed by the manga's
  AniList id (see [chosen source](../stores/manga-source.md)). No choice shows "Source".
- **Scaffolding**: `MOCK_SOURCES` (50 names) stands in for a registry; nothing is
  fetched, and a name in it does not mean the app can read that site.

An installable source is an [extension](extension.md).
