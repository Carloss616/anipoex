import { observable } from "@legendapp/state";
import { synced, syncObservable } from "@legendapp/state/sync";
import * as SecureStore from "expo-secure-store";
import { ObservablePersist } from "@/state/observable-persist";

const TOKEN_KEY = "github_access_token";

export interface GitHubAccount {
  login: string;
  avatarUrl: string;
  /** The sync gist, once found or made. */
  gistId?: string;
}

/** The GitHub connection sync uses; the token stays in the Keychain / Keystore. */
export const github$ = observable({
  token: synced({
    get: () => SecureStore.getItem(TOKEN_KEY) || undefined,
    set: ({ value }) =>
      value
        ? SecureStore.setItemAsync(TOKEN_KEY, value)
        : SecureStore.deleteItemAsync(TOKEN_KEY),
  }),
  account: undefined as GitHubAccount | undefined,
});

syncObservable(github$.account, {
  persist: { name: "github-account", plugin: ObservablePersist },
});
