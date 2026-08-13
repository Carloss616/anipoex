import { observable, syncState } from "@legendapp/state";
// MMKV on web is a localStorage shim that throws during the Node render pass.
// This plugin no-ops when localStorage is missing, so SSR stays quiet.
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";
import { syncObservable } from "@legendapp/state/sync";
import type { User } from "@/features/auth/types/tracker";

export const session$ = observable({
  token: undefined as string | undefined,
  user: undefined as User | undefined,
});

syncObservable(session$.token, {
  persist: {
    name: "session-token",
    plugin: ObservablePersistLocalStorage,
  },
});

syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersistLocalStorage,
  },
});

export async function clearSession() {
  session$.token.set(undefined);
  session$.user.set(undefined);
  await syncState(session$.token).clearPersist();
  try {
    await syncState(session$.user).clearPersist();
  } catch (error) {
    console.warn(
      "[session] failed to clear cached user from localStorage",
      error instanceof Error ? error.message : error,
    );
  }
}
