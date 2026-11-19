import { Platform } from "react-native";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { SyncSection } from "./components/sync-section";
import { ConnectSheet } from "./components/sync-section/connect-sheet";

export function Sync() {
  return (
    <SettingsPage
      title="Sync"
      // The web section renders its own; a native sheet sits beside the list.
      overlays={Platform.OS !== "web" && <ConnectSheet />}
    >
      <SyncSection />
    </SettingsPage>
  );
}
