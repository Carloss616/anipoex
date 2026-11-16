import { observe } from "@legendapp/state";
import { Platform } from "react-native";
import { desktop } from "@/utils/desktop";
import {
  type GitHubPost,
  pollForToken,
  requestDeviceCode,
} from "../utils/device-flow";
import {
  createGistTarget,
  fetchGitHubUser,
  findOrCreateGist,
  SyncError,
} from "../utils/github";
import { setSyncTarget, syncState$ } from "./engine";
import { github$ } from "./github";

const CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID ?? "";

/** The code sign-in works in the apps; a browser can't reach its endpoints. */
export const canUseDeviceFlow = Platform.OS !== "web" || !!desktop;

const bridge = desktop;
const post: GitHubPost = bridge
  ? (url, body) => bridge.github(url, body)
  : async (url, body) => {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      return res.json();
    };

/**
 * Connects with `token` once it has found or made the sync gist, which also
 * proves it has the `gist` scope; the first sync starts at once.
 */
export async function connectGitHub(token: string) {
  const user = await fetchGitHubUser(token);
  const gistId = await findOrCreateGist(token).catch((error) => {
    if (error instanceof SyncError && error.kind === "offline") throw error;
    throw new SyncError("auth", "This token can't use your gists");
  });
  github$.account.set({
    login: user.login,
    avatarUrl: user.avatar_url,
    gistId,
  });
  github$.token.set(token);
}

/**
 * Starts the code sign-in: resolves to the code to show, and `connected`
 * settles once the user authorizes it on GitHub (or denies it, or it expires).
 */
export async function startDeviceFlow(signal?: AbortSignal) {
  const code = await requestDeviceCode(CLIENT_ID, post);
  const connected = pollForToken(CLIENT_ID, code, post, { signal }).then(
    connectGitHub,
  );
  return { code, connected };
}

/** Stops syncing and forgets the token; the gist stays on GitHub. */
export function disconnectGitHub() {
  github$.token.set(undefined);
  github$.account.set(undefined);
  syncState$.assign({ lastSync: undefined, error: undefined });
}

// Syncs with the gist while a token is set.
observe(() => {
  const token = github$.token.get();
  setSyncTarget(
    token
      ? createGistTarget({
          token,
          gistId: {
            get: () => github$.account.gistId.peek(),
            // A late write after a disconnect would bring the account back.
            set: (id) => {
              if (github$.token.peek() === token)
                github$.account.gistId.set(id);
            },
          },
        })
      : undefined,
  );
});
