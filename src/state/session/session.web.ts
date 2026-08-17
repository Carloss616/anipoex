import { observable, syncState } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import type { User } from "@/features/auth/types/tracker";
import { ObservablePersist } from "../observable-persist";

export const session$ = observable({
  token: undefined as string | undefined,
  user: undefined as User | undefined,
});

syncObservable(session$.token, {
  persist: {
    name: "session-token",
    plugin: ObservablePersist,
  },
});

syncObservable(session$.user, {
  persist: {
    name: "session-user",
    plugin: ObservablePersist,
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
