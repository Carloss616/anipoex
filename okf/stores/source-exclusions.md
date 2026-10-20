---
type: Persisted Store
title: Source exclusions
description: Which sources are dropped from each manga's list, and why.
resource: ../../src/features/manga/state/exclusions.ts
tags: [sources, exclusions, persistence]
generated: { by: claude-code/claude-sonnet-5-5, at: 2026-10-20T00:00:00Z }
---

Key `msu-exclusions`: `{ [anilistId]: { [sourceId]: { reason, updatedAt, deletedAt? } } }`.
Times are epoch ms; a record with `deletedAt` is a removed exclusion, kept so the removal
can sync.

It is the same layout as the plugin's `exclusions` map and its gist file
`seanime-msu-exclusions.json`, keyed by the app's source ids (not seanime's).

Records of an uninstalled source stay and apply again if it's reinstalled. Survives
sign-out and doesn't sync yet.

Meaning: [source exclusion](../concepts/source-exclusion.md).
