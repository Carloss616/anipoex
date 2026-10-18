---
type: Persisted Store
title: Chosen source
description: The source picked for each manga, keyed by AniList id.
resource: ../../src/features/manga/state/source.ts
tags: [sources, preferences, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

Key `manga-source`: `{ [anilistId]: sourceId }`. A missing key means no
[source](../concepts/source.md) chosen. Survives sign-out (it is not cleared) and does
not sync anywhere. Source ids come from a mocked list today.
