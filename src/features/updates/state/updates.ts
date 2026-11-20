import { observable, observe } from "@legendapp/state";
import Constants from "expo-constants";
import { AppState, Platform } from "react-native";
import { toast } from "@/components/ui/toast";
import { network$ } from "@/state/network";
import { settings$ } from "@/state/settings";
import { backgroundWork } from "@/utils/background-time";
import { isCheckDue } from "../utils/check-due";
import {
  downloadApk,
  isApkDownloaded,
  openInstaller,
} from "../utils/install-apk";
import { fetchUpdate, type Update } from "../utils/release";

export const APP_VERSION = Constants.expoConfig?.version ?? "0.0.0";

/** The commit a release build was made from; none in local builds. */
export const APP_COMMIT: string | undefined =
  Constants.expoConfig?.extra?.commit;

/**
 * The release file this app updates from: Android installs the APK itself,
 * iOS hands the IPA to SideStore. None on web and desktop.
 */
const UPDATE_FILE = Platform.select({ android: ".apk", ios: ".ipa" });

export const updates$ = observable({
  checking: false,
  /** The newer release found by the last check. */
  available: undefined as Update | undefined,
  /** The sheet that offers `available`. */
  open: false,
  /** How much of the APK has downloaded, 0 to 1, while it downloads. */
  progress: undefined as number | undefined,
  /** The version whose APK is downloaded, ready to install. */
  downloaded: undefined as string | undefined,
  /** Why the last download failed; shown in the sheet, over any toast. */
  error: undefined as string | undefined,
});

/** Whether the offered update only needs installing. */
export const isUpdateReady = () => {
  const version = updates$.available.get()?.version;
  return !!version && updates$.downloaded.get() === version;
};

/** Looks for a newer release; a manual check also says when there's none. */
export async function checkForUpdates({ manual = false } = {}) {
  if (!UPDATE_FILE || updates$.checking.peek()) return;
  updates$.checking.set(true);
  try {
    const update = await fetchUpdate(APP_VERSION, UPDATE_FILE);
    settings$.device.updateCheckedAt.set(Date.now());
    updates$.available.set(update);
    if (update) updates$.open.set(true);
    else if (manual) toast.success("Anipoex is up to date");
  } catch {
    if (manual) toast.error("Couldn't reach GitHub to check for updates");
  } finally {
    updates$.checking.set(false);
  }
}

// The download keeps going when the user leaves the app mid-way.
const work = backgroundWork("Update", {
  running: () => updates$.progress.peek() !== undefined,
  expire: () => {},
  back: () => {},
});

/** Android won't open the installer from the background: wait for the app. */
let installOnReturn = false;

/** Downloads the offered APK and hands it to Android's installer. */
export async function installUpdate() {
  const update = updates$.available.peek();
  if (!update || updates$.progress.peek() !== undefined) return;
  updates$.error.set(undefined);
  if (updates$.downloaded.peek() !== update.version || !isApkDownloaded()) {
    updates$.progress.set(0);
    work.hold();
    try {
      await downloadApk(update, (fraction) => {
        updates$.progress.set(fraction);
        work.progress(fraction);
      });
      updates$.downloaded.set(update.version);
    } catch {
      updates$.error.set("Couldn't download the update. Try again.");
      return;
    } finally {
      updates$.progress.set(undefined);
      work.release();
    }
    // The sheet was closed meanwhile: offer it again, not a surprise installer.
    if (!updates$.open.peek()) {
      updates$.open.set(true);
      return;
    }
  }
  if (AppState.currentState === "active") void install();
  else installOnReturn = true;
}

async function install() {
  try {
    await openInstaller();
  } catch {
    updates$.error.set("Couldn't open the installer. Try again.");
  }
}

function checkIfDue() {
  if (!UPDATE_FILE || __DEV__ || !network$.online.peek()) return;
  if (isCheckDue(settings$.device.peek(), Date.now())) void checkForUpdates();
}

// The app counts as online only once AniList answers, after launch.
observe(() => {
  if (network$.online.get()) checkIfDue();
});
AppState.addEventListener("change", (state) => {
  if (state !== "active") return;
  checkIfDue();
  if (!installOnReturn) return;
  installOnReturn = false;
  void install();
});
