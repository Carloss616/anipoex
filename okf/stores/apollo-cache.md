---
type: Persisted Store
title: Apollo cache
description: Every AniList response in Apollo's normalized cache, persisted as one MMKV snapshot and restored at launch.
resource: ../../src/graphql/client.ts
tags: [cache, persistence, apollo]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

- Normalized `InMemoryCache`: `Media` and `MediaList` by `id`, so a save updates
  every screen that shows the entry.
- Persisted to the MMKV instance `apollo-cache`, key `snapshot`, debounced 2 s, **no
  size limit** (the 1 MB default silently stopped persisting once a few lists were in).
- Restored at import time, before the tree mounts. An unreadable snapshot costs a cold
  cache, never the boot.
- Cleared, memory and disk, on sign-out.
- Nothing persists on web's server render.
