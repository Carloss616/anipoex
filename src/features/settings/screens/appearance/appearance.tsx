import { SettingsPage } from "@/features/settings/components/settings-page";
import { AppearanceSection } from "./components/appearance-section";

export function Appearance() {
  return (
    <SettingsPage title="Appearance">
      <AppearanceSection />
    </SettingsPage>
  );
}
