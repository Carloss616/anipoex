---
type: Domain Concept
title: Tracker (AniList)
description: The service that holds the user's list; AniList is the only one, signed in to with an OAuth implicit grant.
tags: [auth, anilist, tracker]
generated: { by: claude-code/claude-opus-5-5, at: 2026-10-18T00:00:00Z }
---

A **tracker** is the service that owns the user's list. The `Tracker` contract has two
calls, `authorize()` and `fetchViewer()`, so a second provider could be added without
touching callers; today `id` can only be `"anilist"`.

# Signing in

- **Implicit grant, not code grant.** AniList's code grant needs `client_secret` at the
  exchange and has no PKCE, so on a device the only safe option is implicit: the
  token arrives in the redirect URL's fragment (`#access_token=…`).
- **The token is a one-year credential with no scopes.** There is no refresh token;
  when it expires the user signs in again.
- **Two AniList client IDs**, because AniList allows one redirect URL per registered
  app: native redirects to `anipoex://auth`, web to `<origin>/auth`. AniList matches
  the redirect exactly, so web must run on the origin registered for its ID.
- **The desktop app signs in with the web client ID**, in a window of its own: the
  sign-in ends at the first redirect carrying the token or the error, which is read from
  its URL and never loaded, so the desktop app needs no origin of its own registered.
- **Cancelling is not an error**: `authorize()` resolves `null`.
- After the token, `fetchViewer()` loads the [viewer](viewer.md). Both end up in the
  [session](../stores/session.md).

# Access

Every route except `/sign-in` is guarded by the presence of a token; with one,
`/sign-in` redirects home. Every request carries it as `Authorization: Bearer`.

# Signing out

Clears the [session](../stores/session.md) and the [Apollo cache](../stores/apollo-cache.md),
memory and disk. A failure in either is toasted, not swallowed.
