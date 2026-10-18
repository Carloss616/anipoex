---
type: Persisted Store
title: Session
description: The AniList access token and the cached viewer — SecureStore plus MMKV on native, localStorage on web.
resource: ../../src/state/session/
tags: [auth, session, persistence]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

| Field | Native | Web |
|---|---|---|
| `token` | SecureStore key `anilist_access_token` | localStorage `session-token` |
| `user` | MMKV `session-user` | localStorage `session-user` |

- `token` is the one-year credential from the [tracker](../concepts/tracker.md). Its
  presence alone decides whether the app is signed in.
- `user` is the normalized [viewer](../concepts/viewer.md); read synchronously at
  launch, so there is no loading state.
- **Sign-out** sets both to undefined and clears the persisted user, then clears the
  [Apollo cache](apollo-cache.md). A failure to clear the cached user is logged; any
  other failure is toasted.
