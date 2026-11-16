import { observable } from "@legendapp/state";
import { syncObservable } from "@legendapp/state/sync";
import { ObservablePersist } from "@/state/observable-persist";
import type { GitHubAccount } from "./github";

/** The GitHub connection sync uses; the browser has no keychain. */
export const github$ = observable({
  token: undefined as string | undefined,
  account: undefined as GitHubAccount | undefined,
});

syncObservable(github$.token, {
  persist: { name: "github-token", plugin: ObservablePersist },
});
syncObservable(github$.account, {
  persist: { name: "github-account", plugin: ObservablePersist },
});
