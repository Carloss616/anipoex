---
type: Derived Metric
title: List counts
description: How many entries the viewer has under each list status — null until loaded, custom lists excluded.
resource: ../../src/features/manga/utils/to-counts.ts
tags: [metrics, list, counts]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

From [MangaListCounts](../operations/manga-list-counts.md): for each of the six
[list statuses](../concepts/list-status.md), the number of entries across the lists
that have that status and are **not custom**.

- **Null, not 0, until loaded**, so the picker can tell "empty" from "not fetched".
- **Custom lists never add**: their entries are already filed under a status.
- Shown next to each status in the Manga tab's list picker.
