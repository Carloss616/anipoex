# AniList Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sign in with AniList, keep the session across app restarts, and sign out.

**Architecture:** OAuth implicit grant through `expo-web-browser` — the token comes back in the redirect URL fragment. The token lives in `expo-secure-store`; the cached user lives in MMKV through Legend State. Both reads are synchronous at module init, so there is no loading state and no hydration race. One `Tracker` contract fronts the provider so a second tracker can be added without touching consumers.

**Tech Stack:** Expo SDK 57, React Native 0.86, Expo Router (NativeTabs), Legend State v3 (beta), react-native-mmkv, expo-secure-store, HeroUI Native, Uniwind, Biome, bun.

Spec: [2026-08-07-anilist-auth-design.md](../specs/2026-08-07-anilist-auth-design.md)

## Global Constraints

- **Formatting:** Biome. Double quotes, semicolons, 2-space indent. Run `bun run check:fix` before every commit.
- **Naming:** kebab-case for every file and folder inside `src/`.
- **Imports:** use the `@/*` alias for cross-feature imports; relative paths within a feature.
- **Restricted imports (enforced by Biome, will fail `check`):** import `Button` from `@/components/ui/button`, never `heroui-native/button`. Import `Column`/`Row`/`ScrollView` from `@/components/layout/*`, never from `@expo/ui` or `react-native`. Import `Typography` from `@/components/ui/typography`.
- **`Typography` `color` accepts only `"default" | "muted"`.** Anything else is a type error — use a `className` such as `text-danger` for other colors. The `--danger` token is defined for both themes in [theme.css](../../../src/styles/theme.css).
- **Barrel exports:** every folder-based component/screen has an `index.ts` re-exporting the main file without a platform suffix.
- **Client ID:** read from `process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID`. Already present in `.env.local`, which is gitignored. Never hardcode it, never commit it.
- **Redirect URI:** `anipoex://auth`, already registered in the AniList app settings. `scheme: "anipoex"` is already in `app.json` — do not change it.
- **Authorize URL takes exactly two params** (`client_id`, `response_type=token`). Do **not** send `redirect_uri`; AniList uses the registered one.
- **Typecheck:** `bun run typecheck` must pass before every commit.

## Deviation from the spec — read before starting

The spec's file list includes `src/app/sign-in.tsx` as a route. **That route is not created.** The root layout ([src/app/_layout.tsx:37](../../../src/app/_layout.tsx#L37)) renders `<Tabs />` (`NativeTabs`) directly with no Stack wrapper, so a sibling route file has no way to be presented without restructuring navigation — which is out of the approved scope, and which the spec explicitly defers along with route guards.

Instead, `SignIn` is built as a normal screen component under `features/auth/screens/sign-in/` exactly as specified, and the Home screen renders it when there is no session. When the route guard lands, `app/sign-in.tsx` and the Stack wrapper get added then, and `SignIn` is reused untouched.

---

### Task 1: Move `use-manga-lists.ts` into `features/manga/hooks/`

Pure rename, landed first and alone so it does not muddy the auth diff. It has exactly one importer.

**Files:**
- Move: `src/features/manga/use-manga-lists.ts` → `src/features/manga/hooks/use-manga-lists.ts`
- Modify: `src/features/manga/screens/manga-list/manga-list.tsx:8`

`mocks.ts` stays at the feature root — it has seven importers using relative paths and is deleted once real queries land. Moving it is churn on a file with an expiry date.

- [ ] **Step 1: Move the file with git so history follows**

```bash
mkdir -p src/features/manga/hooks
git mv src/features/manga/use-manga-lists.ts src/features/manga/hooks/use-manga-lists.ts
```

- [ ] **Step 2: Fix the import inside the moved file**

It imports `./mocks`, which is now one level up. In `src/features/manga/hooks/use-manga-lists.ts` change line 1:

```ts
import { MANGA_LISTS } from "../mocks";
```

- [ ] **Step 3: Fix the one importer**

In `src/features/manga/screens/manga-list/manga-list.tsx` change line 8:

```ts
import { useMangaLists } from "../../hooks/use-manga-lists";
```

- [ ] **Step 4: Verify nothing else references the old path**

Run: `grep -rn "use-manga-lists" src`
Expected: exactly two hits — the file itself and `manga-list.tsx:8`, both on the new path.

- [ ] **Step 5: Typecheck and lint**

Run: `bun run typecheck && bun run check`
Expected: both pass, no errors.

- [ ] **Step 6: Commit**

```bash
git add -A src/features/manga
git commit -m "refactor: move use-manga-lists into features/manga/hooks"
```

---

### Task 2: Install dependencies

**Files:**
- Modify: `package.json`

Three packages. All contain native code, so a Metro reload will not pick them up — a native rebuild is required.

Note `@legendapp/state` v3 is still **beta** and installs from the `@beta` tag. Pin whatever exact version resolves; do not use a caret range on a beta.

- [ ] **Step 1: Install**

```bash
bunx expo install expo-secure-store react-native-mmkv
bun add @legendapp/state@beta
```

- [ ] **Step 2: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "bun test"
```

- [ ] **Step 3: Pin the beta**

Open `package.json` and confirm `@legendapp/state` is an exact version (e.g. `"3.0.0-beta.30"`), not `"^3.0.0-beta.30"`. Remove the caret if present.

- [ ] **Step 4: Rebuild native**

```bash
bun run prebuild
bun run ios
```

Expected: the app builds and launches unchanged. Nothing visible should differ yet — this step only proves the three native modules link.

- [ ] **Step 5: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add secure-store, mmkv and legend-state"
```

---

### Task 3: `parseFragment`

The one piece of pure logic, and the only unit-tested one. It lives alone with zero imports so `bun test` runs it without a React Native test runner.

**Files:**
- Create: `src/features/auth/utils/parse-fragment.ts`
- Test: `src/features/auth/utils/parse-fragment.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseFragment(url: string): Record<string, string>`

- [ ] **Step 1: Write the failing test**

Create `src/features/auth/utils/parse-fragment.test.ts`:

```ts
import { expect, test } from "bun:test";
import { parseFragment } from "./parse-fragment";

test("reads access_token out of the fragment", () => {
  const url = "anipoex://auth#access_token=abc123&token_type=Bearer";
  expect(parseFragment(url).access_token).toBe("abc123");
});

test("keeps the other fragment params", () => {
  const url = "anipoex://auth#access_token=abc123&token_type=Bearer&expires_in=31536000";
  expect(parseFragment(url)).toEqual({
    access_token: "abc123",
    token_type: "Bearer",
    expires_in: "31536000",
  });
});

test("returns empty when there is no fragment", () => {
  expect(parseFragment("anipoex://auth")).toEqual({});
});

test("returns empty when the fragment is blank", () => {
  expect(parseFragment("anipoex://auth#")).toEqual({});
});

test("has no access_token when AniList returns an error instead", () => {
  const url = "anipoex://auth#error=access_denied";
  expect(parseFragment(url).access_token).toBeUndefined();
});

test("decodes percent-encoded values", () => {
  const url = "anipoex://auth#access_token=a%2Bb%3Dc";
  expect(parseFragment(url).access_token).toBe("a+b=c");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test src/features/auth/utils/parse-fragment.test.ts`
Expected: FAIL — cannot resolve `./parse-fragment`.

- [ ] **Step 3: Write the implementation**

Create `src/features/auth/utils/parse-fragment.ts`:

```ts
/**
 * Reads the params out of a URL fragment (`#a=1&b=2`).
 *
 * `Linking.parse()` only handles query strings, and AniList's implicit grant
 * returns the token in the fragment.
 */
// ponytail: hand-rolled instead of URLSearchParams — Hermes' polyfill has
// historically had spotty iterator support, and this keeps the module
// import-free so `bun test` runs it without a React Native test runner.
export function parseFragment(url: string): Record<string, string> {
  const fragment = url.split("#")[1];
  if (!fragment) return {};

  const params: Record<string, string> = {};
  for (const pair of fragment.split("&")) {
    if (!pair) continue;
    const separator = pair.indexOf("=");
    const key = separator === -1 ? pair : pair.slice(0, separator);
    const value = separator === -1 ? "" : pair.slice(separator + 1);
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }
  return params;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test src/features/auth/utils/parse-fragment.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Lint and typecheck**

Run: `bun run check:fix && bun run typecheck`
Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/utils package.json
git commit -m "feat: add parseFragment for OAuth redirect fragments"
```

---

### Task 4: The `Tracker` contract and the AniList implementation

**Files:**
- Create: `src/features/auth/types/tracker.ts`
- Create: `src/features/auth/trackers/anilist.ts`

**Interfaces:**
- Consumes: `parseFragment(url: string): Record<string, string>` from Task 3.
- Produces:
  - `type User = { id: number; name: string; avatarUrl: string | null }`
  - `type Tracker` (shape below)
  - `class UnauthorizedError extends Error`
  - `const anilist: Tracker`

- [ ] **Step 1: Write the contract**

Create `src/features/auth/types/tracker.ts`:

```ts
/** Normalized across providers — MyAnimeList returns a different shape for the same fields. */
export type User = {
  id: number;
  name: string;
  avatarUrl: string | null;
};

export type Tracker = {
  id: "anilist";
  /** Resolves to null when the user cancels — that is not an error. */
  authorize(): Promise<{ accessToken: string } | null>;
  fetchViewer(token: string): Promise<User>;
};

/**
 * The token is expired or revoked. Callers must clear the session.
 * Distinct from a network failure, where the token is still good.
 */
// ponytail: a runtime class in types/ because it is part of the Tracker
// contract, not a separate concern. Move it out if a second error joins it.
export class UnauthorizedError extends Error {
  constructor() {
    super("El token de AniList expiró o fue revocado");
    this.name = "UnauthorizedError";
  }
}
```

- [ ] **Step 2: Write the AniList tracker**

Create `src/features/auth/trackers/anilist.ts`:

```ts
import * as WebBrowser from "expo-web-browser";
import { type Tracker, UnauthorizedError, type User } from "../types/tracker";
import { parseFragment } from "../utils/parse-fragment";

const AUTHORIZE_URL = "https://anilist.co/api/v2/oauth/authorize";
const GRAPHQL_URL = "https://graphql.anilist.co";
const REDIRECT_URI = "anipoex://auth";

const VIEWER_QUERY = "query { Viewer { id name avatar { large } } }";

type ViewerResponse = {
  data?: { Viewer?: { id: number; name: string; avatar?: { large?: string } } };
};

export const anilist: Tracker = {
  id: "anilist",

  async authorize() {
    const clientId = process.env.EXPO_PUBLIC_ANILIST_CLIENT_ID;
    if (!clientId) {
      throw new Error("Falta EXPO_PUBLIC_ANILIST_CLIENT_ID en .env.local");
    }

    // Implicit grant takes only these two params. The redirect URI comes from
    // the AniList app registration, not from the query string.
    const url = `${AUTHORIZE_URL}?client_id=${clientId}&response_type=token`;
    const result = await WebBrowser.openAuthSessionAsync(url, REDIRECT_URI);

    if (result.type !== "success") return null;

    const accessToken = parseFragment(result.url).access_token;
    if (!accessToken) {
      throw new Error("AniList no devolvió un access_token");
    }
    return { accessToken };
  },

  async fetchViewer(token: string): Promise<User> {
    const response = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query: VIEWER_QUERY }),
    });

    if (response.status === 401) throw new UnauthorizedError();
    if (!response.ok) {
      throw new Error(`AniList respondió ${response.status}`);
    }

    const json = (await response.json()) as ViewerResponse;
    const viewer = json.data?.Viewer;
    if (!viewer) {
      throw new Error("AniList no devolvió Viewer");
    }

    return {
      id: viewer.id,
      name: viewer.name,
      avatarUrl: viewer.avatar?.large ?? null,
    };
  },
};
```

- [ ] **Step 3: Typecheck and lint**

Run: `bun run typecheck && bun run check:fix`
Expected: both pass.

- [ ] **Step 4: Confirm the test suite still runs clean**

Run: `bun test`
Expected: PASS, 6 tests. `bun test` must not try to load `anilist.ts` — if it does, the import-free isolation of `parse-fragment.ts` has been broken.

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/types src/features/auth/trackers
git commit -m "feat: add Tracker contract and AniList implementation"
```

---

### Task 5: The session store

Token in SecureStore, user in MMKV. Both read synchronously at module init, so consumers never see a loading state.

**Files:**
- Create: `src/state/session.ts`

**Interfaces:**
- Consumes: `User`, `UnauthorizedError` from Task 4.
- Produces:
  - `session$` — observable `{ token: string | null; user: User | null }`
  - `setSession(token: string, user: User): Promise<void>`
  - `clearSession(): Promise<void>`

- [ ] **Step 1: Write the store**

Create `src/state/session.ts`:

```ts
import { observable, syncState } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
import * as SecureStore from "expo-secure-store";
import type { User } from "@/features/auth/types/tracker";

const TOKEN_KEY = "anilist_access_token";

export const session$ = observable({
  // Read synchronously at module init. SecureStore has a sync getItem, so there
  // is no hydration race and no loading state to render around.
  token: SecureStore.getItem(TOKEN_KEY),
  user: null as User | null,
});

// Only `user` is persisted, and only as a cache so the avatar paints on the
// first frame. The token never touches MMKV — presence of a token is what
// proves authentication, and a cached user alone must never stand in for it.
syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersistMMKV,
  },
});

export async function setSession(token: string, user: User) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  session$.token.set(token);
  session$.user.set(user);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  session$.token.set(null);
  session$.user.set(null);
  await syncState(session$.user).clearPersist();
}
```

- [ ] **Step 2: Typecheck**

Run: `bun run typecheck`
Expected: PASS.

If `syncObservable(session$.user, ...)` is rejected because the plugin only accepts a root observable, fall back to giving the cache its own observable:

```ts
export const user$ = observable<User | null>(null);
syncObservable(user$, { persist: { name: "session-user", plugin: ObservablePersistMMKV } });
```

and keep `session$` for the token only. Update Task 6's reads to match if you take this path.

- [ ] **Step 3: Lint**

Run: `bun run check:fix`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/state
git commit -m "feat: add session store on secure-store and mmkv"
```

---

### Task 6: Sign-in screen and wiring it into Home

**Files:**
- Create: `src/features/auth/screens/sign-in/sign-in.tsx`
- Create: `src/features/auth/screens/sign-in/index.ts`
- Modify: `src/features/home/screens/home.tsx`

**Interfaces:**
- Consumes: `anilist` (Task 4), `session$` / `setSession` / `clearSession` (Task 5), `UnauthorizedError` (Task 4).
- Produces: `SignIn` component.

- [ ] **Step 1: Write the sign-in screen**

Create `src/features/auth/screens/sign-in/sign-in.tsx`:

```ts
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { setSession } from "@/state/session";
import { anilist } from "../../trackers/anilist";

export function SignIn() {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setIsBusy(true);
    setError(null);
    try {
      const result = await anilist.authorize();
      // null means the user backed out of the browser — not an error.
      if (!result) return;

      const user = await anilist.fetchViewer(result.accessToken);
      await setSession(result.accessToken, user);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Algo salió mal");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Column alignment="center" className="gap-4 px-8 py-24">
      <Typography type="h5" align="center">
        Conecta tu cuenta
      </Typography>
      <Typography type="body-xs" align="center" color="muted">
        Sincroniza tu progreso de lectura con AniList.
      </Typography>
      <Button onPress={handleSignIn} isDisabled={isBusy}>
        {isBusy ? "Conectando..." : "Entrar con AniList"}
      </Button>
      {error && (
        <Typography type="body-xs" align="center" className="text-danger">
          {error}
        </Typography>
      )}
    </Column>
  );
}
```

- [ ] **Step 2: Write the barrel**

Create `src/features/auth/screens/sign-in/index.ts`:

```ts
export * from "./sign-in";
```

- [ ] **Step 3: Wire Home to the session**

Replace `src/features/home/screens/home.tsx` entirely:

```ts
import { useValue } from "@legendapp/state/react";
import { Column } from "@/components/layout/column";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { SignIn } from "@/features/auth/screens/sign-in";
import { clearSession, session$ } from "@/state/session";

export function Home() {
  const token = useValue(session$.token);
  const user = useValue(session$.user);

  // The token is the proof of session. A cached user without one is stale.
  if (!token) return <SignIn />;

  return (
    <Column alignment="center" className="gap-4 px-8 py-24">
      <Typography type="h5" align="center">
        {user ? `Hola, ${user.name}` : "Sesión activa"}
      </Typography>
      <Button variant="outline" onPress={clearSession}>
        Cerrar sesión
      </Button>
      <ThemeToggle />
    </Column>
  );
}
```

`useValue` is the v3 hook — `use$` and `useSelector` are deprecated. Do not use them.

- [ ] **Step 4: Typecheck, lint, test**

Run: `bun run typecheck && bun run check:fix && bun test`
Expected: all pass, 6 tests.

- [ ] **Step 5: Verify on a device — the full loop**

Run: `bun run ios`

Walk the loop and confirm each step:

1. Home shows "Conecta tu cuenta" with the button.
2. Tap it → the AniList consent page opens in a system browser sheet.
3. Approve → the sheet closes on its own and Home shows "Hola, `<tu usuario>`".
4. **Cancel path:** sign out, tap the button again, dismiss the browser without approving. Nothing changes, no error is shown, the button is tappable again.
5. **Cold start:** fully kill the app (swipe it away, not just background it) and reopen. It lands straight on "Hola, …" with no flash of the sign-in screen.
6. **Logout:** tap "Cerrar sesión" → back to "Conecta tu cuenta". Kill and reopen the app; it stays signed out.
7. Sign in again without reinstalling. It works.

If step 5 flashes the sign-in screen before the greeting, the token read is not synchronous — check that `SecureStore.getItem` (not `getItemAsync`) is used in `session.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/features/auth/screens src/features/home
git commit -m "feat: add AniList sign-in and session UI"
```

---

## Done when

All six tasks are committed, `bun run typecheck`, `bun run check` and `bun test` pass, and the seven-point device walkthrough in Task 6 Step 5 completes without a reinstall.

## Deliberately not built

Route guards and the held splash screen, token refresh (AniList issues none), proactive `exp` checking on the JWT, the 401-triggered re-auth path, a second tracker, provider switching, and the profile screen.

The 401 path deserves a note: `UnauthorizedError` is defined and thrown by `fetchViewer`, but nothing catches it specifically yet — it surfaces as an error message like any other. Wiring it to auto-clear the session belongs with the route guard, since without a guard there is nowhere to redirect to.
