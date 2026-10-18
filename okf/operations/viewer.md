---
type: GraphQL Query
title: Viewer
description: The signed-in AniList user — id, name, large avatar and score format.
resource: ../../src/features/auth/trackers/anilist/graphql/viewer.gql
tags: [auth, viewer]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

```graphql
query Viewer { Viewer { id name avatar { large } mediaListOptions { scoreFormat } } }
```

- **Called by** sign-in, right after the token arrives, and by the launch backfill when
  the persisted viewer has no `scoreFormat` (see [viewer](../concepts/viewer.md)).
- Always `network-only`, and `silent`: sign-in reports its own failure.
- The result is normalized and written to the [session](../stores/session.md).
