---
type: Derived Metric
title: Reading progress
description: What a card shows about how far the user has read — the c.N or c.N/total caption, its spoken form and the bar fraction.
resource: ../../src/features/manga/utils/progress.ts
tags: [metrics, progress]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

From the [list entry](../concepts/list-entry.md)'s `progress` (null counts as 0) and
the [manga](../concepts/manga.md)'s `chapters`:

| `chapters` | Caption | Spoken | Bar |
|---|---|---|---|
| known | `c.12/40` | "12 of 40 chapters read" | `min(12/40, 1)` |
| null or 0 | `c.12` | "12 chapters read" | none |

The bar is capped at 1, so progress past a stale total never overflows.
