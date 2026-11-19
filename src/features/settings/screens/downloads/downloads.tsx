import { isRuntimeAvailable } from "@/features/extensions";
import { BackToIndex } from "@/features/settings/components/back-to-index";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { DownloadsSection } from "./components/downloads-section";
import { MoveDownloadsDialog } from "./components/move-downloads-dialog";

export function Downloads() {
  // A plain browser downloads nothing.
  if (!isRuntimeAvailable) return <BackToIndex />;

  return (
    <SettingsPage title="Downloads" overlays={<MoveDownloadsDialog />}>
      <DownloadsSection />
    </SettingsPage>
  );
}
