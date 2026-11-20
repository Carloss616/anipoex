import { File, Paths } from "expo-file-system";
import { startActivityAsync } from "expo-intent-launcher";
import type { Update } from "./release";

// Intent.FLAG_GRANT_READ_URI_PERMISSION: the installer reads our file.
const GRANT_READ_URI = 1;

const apkFile = () => new File(Paths.cache, "anipoex-update.apk");

/** Android may clear the cache between a download and the install. */
export const isApkDownloaded = () => apkFile().exists;

/** Downloads the update's APK to the cache, over the last one. */
export async function downloadApk(
  update: Update,
  onProgress: (fraction: number) => void,
) {
  const file = apkFile();
  await File.downloadFileAsync(update.apkUrl, file, {
    idempotent: true,
    onProgress: ({ bytesWritten, totalBytes }) =>
      onProgress(bytesWritten / (totalBytes > 0 ? totalBytes : update.apkSize)),
  });
}

/** Opens Android's installer on the APK; it asks the user to confirm. */
export async function openInstaller() {
  await startActivityAsync("android.intent.action.VIEW", {
    data: apkFile().contentUri,
    type: "application/vnd.android.package-archive",
    flags: GRANT_READ_URI,
  });
}
