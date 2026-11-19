import { Redirect } from "expo-router";
import { isRuntimeAvailable } from "@/features/extensions";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { DownloadsSection } from "./components/downloads-section";
import { MoveDownloadsDialog } from "./components/move-downloads-dialog";

export function Downloads() {
  // A plain browser downloads nothing.
  if (!isRuntimeAvailable) return <Redirect href="/settings" />;

  return (
    <SettingsPage title="Downloads" overlays={<MoveDownloadsDialog />}>
      <DownloadsSection />
    </SettingsPage>
  );
}
