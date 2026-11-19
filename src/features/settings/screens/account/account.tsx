import { AccountSection } from "@/features/settings/components/account-section";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { SignOut } from "./components/sign-out";

export function Account() {
  return (
    <SettingsPage title="Account">
      <AccountSection />
      <SignOut />
    </SettingsPage>
  );
}
