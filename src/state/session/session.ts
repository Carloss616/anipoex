import { observable, syncState } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { synced, syncObservable } from "@legendapp/state/sync";
import * as SecureStore from "expo-secure-store";
import type { User } from "@/features/auth/types/tracker";

const TOKEN_KEY = "anilist_access_token";

export const session$ = observable({
  token: synced({
    get: () => SecureStore.getItem(TOKEN_KEY) || undefined,
    set: ({ value }) =>
      value
        ? SecureStore.setItemAsync(TOKEN_KEY, value)
        : SecureStore.deleteItemAsync(TOKEN_KEY),
  }),
  user: undefined as User | undefined,
});

syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersistMMKV,
  },
});

export async function clearSession() {
  session$.token.set(undefined);
  session$.user.set(undefined);
  try {
    await syncState(session$.user).clearPersist();
  } catch (error) {
    console.warn(
      "[session] failed to clear cached user from MMKV",
      error instanceof Error ? error.message : error,
    );
  }
}
