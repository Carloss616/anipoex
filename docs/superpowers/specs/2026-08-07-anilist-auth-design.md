# AniList Auth — Design

Login with AniList, persisted across restarts, with logout. First slice of the tracking layer.

## Why implicit grant

AniList's [authorization code grant](https://docs.anilist.co/guide/auth/authorization-code) requires `client_secret` at the token exchange and does not support PKCE — no `code_challenge` / `code_verifier` anywhere in its docs or official snippets. On a device that leaves three options:

| Option | Viable on-device |
| --- | --- |
| Implicit grant | Yes. No secret. |
| Code grant, secret bundled | No. Extractable from the bundle; leaking it is worse than implicit. |
| Code grant via backend proxy | Yes, but requires a deployed service. |

Expo's [authentication guide](https://docs.expo.dev/guides/authentication/) discourages implicit grant ("no longer recommended due to inherent security risks, including the risk of access token injection") and points at code + PKCE. That path is closed for AniList without a backend, and this app is client-only. We take implicit grant knowingly.

`expo-auth-session` is not used. With `ResponseType.Token` it still performs implicit grant — it wraps the flow, it does not make it safer — while requiring `usePKCE: false`, an unverified assumption about whether AniList echoes `state`, and a hook-shaped API. A hook is the wrong shape here: `promptAsync` is only callable from a mounted component, and re-authentication will need to fire from a 401 handler, which is not one.

The dependency earns its place when a second tracker arrives. MyAnimeList mandates PKCE and issues refresh tokens; that provider brings `expo-auth-session` for itself, and AniList is not touched. Two providers share the seam, not the library.

## Seam

Every tracker hides behind one signature. This, not the library choice, is what makes a later migration cheap.

```ts
type Tracker = {
  id: 'anilist'
  authorize(): Promise<{ accessToken: string } | null>  // null = user cancelled
  fetchViewer(token: string): Promise<User>
}
```

Swapping AniList's implementation later means rewriting one function body. `session$`, the screens, and every query stay untouched.

Only AniList is implemented. No registry, no provider switch, no second implementation — those arrive with the second tracker, which will reveal the real boundary. See [use-manga-lists.ts](../../../src/features/manga/use-manga-lists.ts) for the same pattern already in place.

## Prerequisite

Register the app at `anilist.co/settings/developer` with Redirect URL exactly `anipoex://auth`. Put the resulting client ID in `.env.local` (already gitignored) as `EXPO_PUBLIC_ANILIST_CLIENT_ID`.

An OAuth `client_id` for a public client is not a secret, and `EXPO_PUBLIC_` values are inlined into the bundle regardless. `.env.local` is used so each developer can point at their own registration, not to hide the value.

## Files

Follows [app-structure.md](../../app-structure.md).

```
src/
├── state/
│   └── session.ts              # NEW global folder — observable session$
├── features/auth/
│   ├── tracker.ts              # type Tracker
│   ├── anilist.ts              # authorize · fetchViewer
│   ├── parse-fragment.ts       # pure, zero imports
│   ├── parse-fragment.test.ts  # bun test
│   └── screens/sign-in/
│       ├── sign-in.tsx
│       └── index.ts
└── app/
    └── sign-in.tsx             # route wrapper (thin)
```

`state/` is a new global folder, sibling to `features/`. Session does not live in `features/auth/` because manga will read it to authenticate its queries, and the convention sends anything shared by two or more features to the root of `src/`.

## Storage

Two stores, deliberately:

| Data | Where | Why |
| --- | --- | --- |
| `access_token` | `expo-secure-store` | A one-year credential. Keychain / Keystore, not a file on disk. |
| `user` (id, name, avatar) | MMKV via Legend State | Cache. Lets the avatar paint on the first frame without waiting on the network. |

Both live on the observable; only `user` is persisted to MMKV. The token is read and written through SecureStore.

MMKV is not encrypted here. It holds nothing sensitive — a username and an avatar URL, both already public on AniList.

## Flow

Authorize URL takes exactly two parameters. `redirect_uri` is **not** sent; AniList uses the one registered in the app settings.

```
https://anilist.co/api/v2/oauth/authorize?client_id={id}&response_type=token
```

1. `sign-in.tsx` calls `authorize()`.
2. `WebBrowser.openAuthSessionAsync(url, 'anipoex://auth')` opens ASWebAuthenticationSession (iOS) / Custom Tab (Android).
3. Returns `{ type: 'success', url }`. The token arrives in the **URL fragment** as `access_token`.
4. Token → SecureStore, then `session$.token.set(token)`.
5. `fetchViewer(token)` → `POST https://graphql.anilist.co` with `Authorization: Bearer <token>`, `Content-Type: application/json`, `Accept: application/json`, body `query { Viewer { id name avatar { large } } }`.
6. `session$.user.set(viewer)` → Legend State persists `user` to MMKV.
7. **Cold start:** MMKV rehydrates `user` synchronously; the token is read from SecureStore asynchronously. No token means no session, even when a cached user exists — the cached user is never treated as proof of authentication.
8. **Logout:** delete from SecureStore, clear the observable, clear the MMKV persistence.

### Fragment parsing

`Linking.parse()` handles query strings, not fragments, so it cannot be used here. Split on `#` and read `access_token` via `URLSearchParams`.

### Token expiry

AniList tokens are JWTs valid for one year, and there are no refresh tokens. The expiry is already inside the token, so it is not stored separately. This slice does not check `exp` proactively — expiry surfaces as a 401, which is handled below and is the same path a revoked token takes. Reading `exp` is a later refinement, not a correctness gap.

## Errors

| Case | Behavior |
| --- | --- |
| User cancels (`type: 'cancel' \| 'dismiss'`) | Not an error. Return `null`, leave state untouched. |
| `success` but no `access_token` in the fragment | Throw. Surface the failure on screen. Never fail silently. |
| `Viewer` returns 401 | Token expired or revoked. Clear the session, send to `/sign-in`. |
| Network failure on `fetchViewer` | Keep the token, show a retry. A dead network is not a dead token. |

## Verification

`parseFragment` is the only non-trivial pure logic, and the one thing unit-tested: valid fragment, missing `access_token`, empty fragment, extra parameters alongside the token.

It lives in its own module with zero imports so `bun test` runs it as-is. The repo has no test runner, and adding `jest-expo` to cover one pure function is not worth it — but that only holds while the function stays import-free, which is why it is not folded into `anilist.ts` (which imports `expo-web-browser` and would drag in the whole React Native resolution stack). Add `"test": "bun test"` to `package.json`.

The rest requires a device and is verified by hand against the numbered flow above — specifically that step 7 survives a full app kill, and that logout returns to a state where step 1 works again without reinstalling.

## Out of scope

Route guards, held splash screen, token refresh (AniList has none), the second tracker, provider switching, cross-provider ID mapping, and the profile screen.
