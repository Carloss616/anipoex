import { AppState } from "react-native";
import { isRuntimeAvailable } from "@/features/extensions/runtime";
import { network$ } from "@/state/network";
import { noop } from "@/utils/utils";
import { syncDownloadActivity } from "./download-activity-sync";
import { loadDownloaded } from "./downloaded";
import {
  resumeOnline,
  resumeQueue,
  startDownloads,
  suspendOffline,
} from "./run-downloads";

if (isRuntimeAvailable) {
  syncDownloadActivity();
  void loadDownloaded().catch(noop);
  void resumeQueue().then(startDownloads);
  if (!network$.online.peek()) suspendOffline();
  network$.online.onChange(({ value }) =>
    value ? resumeOnline() : suspendOffline(),
  );
  AppState.addEventListener("change", (state) => {
    if (state === "active") startDownloads();
  });
}
