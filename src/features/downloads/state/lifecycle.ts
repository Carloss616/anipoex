import { AppState } from "react-native";
import { isRuntimeAvailable } from "@/features/extensions/runtime";
import { noop } from "@/utils/utils";
import { syncDownloadActivity } from "./download-activity-sync";
import { loadDownloaded } from "./downloaded";
import { resumeQueue, startDownloads } from "./run-downloads";

if (isRuntimeAvailable) {
  syncDownloadActivity();
  void loadDownloaded().catch(noop);
  void resumeQueue().then(startDownloads);
  AppState.addEventListener("change", (state) => {
    if (state === "active") startDownloads();
  });
}
