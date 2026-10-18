---
type: Persisted Store
title: Manga list view
description: How the manga grid looks — a density step relative to the screen width, and whether titles sit below or over the cover.
resource: ../../src/features/manga/state/list-view.ts
tags: [manga, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Key `manga-list-view`.

| Field | Values | Default | Meaning |
|---|---|---|---|
| `density` | `-1`, `0`, `1` | `1` | Columns relative to the breakpoint's base. |
| `title` | `below`, `over` | `below` | Where a card's title sits. |

Base columns per breakpoint: base 3, sm 4, md 5, lg 6, xl 7; shown columns = base +
density. Stored as a **step, not a count**, so rotating or resizing keeps the choice
relative. Anything off the scale (an older build, a hand edit) reads as the default.
