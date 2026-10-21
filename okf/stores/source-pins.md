---
type: Persisted Store
title: Source pins
description: Which exclusions or inclusions the user decided by hand.
resource: ../../src/features/manga/state/exclusions.ts
tags: [sources, exclusions, persistence]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

Key `source-pins`: `{ [anilistId]: { [sourceId]: { updatedAt, deletedAt? } } }`. A live record
means the user chose to exclude or include that source by hand, so a scan never excludes it
by itself. Mirrors the plugin's `pins` map and its gist file `seanime-msu-pins.json`. Survives sign-out and doesn't sync yet.

Meaning: [source exclusion](../concepts/source-exclusion.md).
