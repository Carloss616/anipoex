import { observe } from "@legendapp/state";
import { Platform } from "react-native";
import { toast } from "@/components/ui/toast";
import { settings$ } from "@/state/settings";
import { desktop } from "@/utils/desktop";
import {
  type GitHubPost,
  pollForToken,
  requestDeviceCode,
} from "../utils/device-flow";
import {
  canUseFolder,
  createFolderTarget,
  pickFolder,
  watchFolder,
} from "../utils/folder-target";
import {
  createGistTarget,
  fetchGitHubUser,
  findOrCreateGist,
  SyncError,
} from "../utils/github";
import { leaveTarget, requestSync, setSyncTarget } from "./engine";
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

const LEFT = {
  removed: "this device's files are off it",
  kept: "this device's files stay until the other devices sync its last changes",
  failed: "this device's files couldn't be removed",
} as const;

/** Stops syncing with the gist and forgets the token; the gist stays on GitHub. */
export async function disconnectGitHub() {
  const left = await leaveTarget("gist");
  github$.token.set(undefined);
  github$.account.set(undefined);
  toast.success(`Disconnected from the gist · ${LEFT[left]}`);
}

// Syncs with the gist while a token is set.
observe(() => {
  const token = github$.token.get();
  setSyncTarget(
    "gist",
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

/** Syncs through a folder the user picks; the gist, if connected, goes on too. */
export async function chooseFolder() {
  try {
    const location = await pickFolder();
    if (location) settings$.device.folder.set(location);
  } catch (error) {
    // A dismissed picker rejects too; that's no change, not a failure.
    if ((error as { code?: string }).code === "ERR_PICKER_CANCELLED") return;
    toast.error(
      `Couldn't use that folder: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/** Stops syncing through the folder; other devices' files stay in it. */
export async function stopFolder() {
  const left = await leaveTarget("folder");
  settings$.device.folder.delete();
  toast.success(`Stopped syncing through the folder · ${LEFT[left]}`);
}

// Syncs through the folder while one is set, and at once when it changes.
observe((e) => {
  const location = canUseFolder ? settings$.device.folder.get() : undefined;
  setSyncTarget("folder", location ? createFolderTarget(location) : undefined);
  if (location) e.onCleanup = watchFolder(location, () => void requestSync());
});
