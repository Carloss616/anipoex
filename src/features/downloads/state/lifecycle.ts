import { AppState } from "react-native";
import { isRuntimeAvailable } from "@/features/extensions/runtime";
import { resumeQueue, startDownloads } from "./run-downloads";

if (isRuntimeAvailable) {
  void resumeQueue().then(startDownloads);
  AppState.addEventListener("change", (state) => {
    if (state === "active") startDownloads();
  });
}
