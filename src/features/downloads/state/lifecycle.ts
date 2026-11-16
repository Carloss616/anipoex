import { AppState } from "react-native";
import { isRuntimeAvailable } from "@/features/extensions/runtime";
import { syncDownloadActivity } from "./download-activity-sync";
import { resumeQueue, startDownloads } from "./run-downloads";

if (isRuntimeAvailable) {
  syncDownloadActivity();
  void resumeQueue().then(startDownloads);
  AppState.addEventListener("change", (state) => {
    if (state === "active") startDownloads();
  });
}
