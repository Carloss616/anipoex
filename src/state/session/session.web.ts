import { observable, syncState } from "@legendapp/state";
import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
import type { User } from "@/features/auth/types/tracker";

export const session$ = observable({
  token: undefined as string | undefined,
  user: undefined as User | undefined,
});

syncObservable(session$.token, {
  persist: {
    name: "session-token",
    plugin: ObservablePersistMMKV,
  },
});

syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersistMMKV,
  },
});

export async function setToken(token: string) {
  session$.token.set(token);
}

export function setUser(user: User) {
  session$.user.set(user);
}

export async function clearSession() {
  session$.token.set(undefined);
  session$.user.set(undefined);
  await syncState(session$.token).clearPersist();
  try {
    await syncState(session$.user).clearPersist();
  } catch (error) {
    console.warn(
      "[session] failed to clear cached user from MMKV",
      error instanceof Error ? error.message : error,
    );
  }
}
