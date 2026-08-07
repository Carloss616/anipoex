import { observable, syncState } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
import * as SecureStore from "expo-secure-store";
import type { User } from "@/features/auth/types/tracker";

const TOKEN_KEY = "anilist_access_token";

export const session$ = observable({
  // Sync read at init — no loading state. undefined, not null, to match session.web.ts.
  token: SecureStore.getItem(TOKEN_KEY) ?? undefined,
  user: undefined as User | undefined,
});

syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersistMMKV,
  },
});

export async function setToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  session$.token.set(token);
}

export function setUser(user: User) {
  session$.user.set(user);
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  session$.token.set(undefined);
  session$.user.set(undefined);
  // Display cache, not a credential: a failed wipe must not fail the sign-out.
  try {
    await syncState(session$.user).clearPersist();
  } catch (error) {
    console.warn(
      "[session] failed to clear cached user from MMKV",
      error instanceof Error ? error.message : error,
    );
  }
}
