import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { BackToIndex } from "@/features/settings/components/back-to-index";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { NetworkSection } from "./components/network-section";
import { SourcesSection } from "./components/sources-section";

export function Sources() {
  useLoadInstalled();

  // A plain browser runs no extensions: nothing to pick or resolve.
  if (!isRuntimeAvailable) return <BackToIndex />;

  return (
    <SettingsPage title="Sources">
      <SourcesSection />
      <NetworkSection />
    </SettingsPage>
  );
}
