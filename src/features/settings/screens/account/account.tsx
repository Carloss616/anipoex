import { SettingsPage } from "@/features/settings/components/settings-page";
import { AccountSection } from "./components/account-section";
import { SignOut } from "./components/sign-out";

export function Account() {
  return (
    <SettingsPage title="Account">
      <AccountSection />
      <SignOut />
    </SettingsPage>
  );
}
