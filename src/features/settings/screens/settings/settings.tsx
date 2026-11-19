import { useRouter } from "expo-router";
import { Frame } from "panelui-web/frame";
import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "@/features/settings/components/account-section";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { useSettingsSplit } from "@/features/settings/components/settings-shell";
import { Account } from "@/features/settings/screens/account";
import {
  groupPages,
  visiblePages,
} from "@/features/settings/utils/settings-pages";
import { ActivityRow } from "./components/activity-row";
import { PageRow } from "./components/page-row";
import { PendingRow } from "./components/pending-row";

const GROUPS = groupPages(visiblePages(isRuntimeAvailable));

/** The index: the account, then each page with its current value. */
export function Settings() {
  useLoadInstalled();
  const router = useRouter();

  // Beside the sidebar, which lists the pages, the index is Account.
  if (useSettingsSplit()) return <Account />;

  return (
    <SettingsPage title="Settings" large>
      <AccountSection onPress={() => router.push("/settings/account")} />
      {GROUPS.map(({ group, title, pages }) => (
        <Frame key={group}>
          <Frame.Header>
            <Frame.Title>{title}</Frame.Title>
          </Frame.Header>
          <Frame.Panel data-attached="column">
            {group === "status" ? (
              <>
                <ActivityRow />
                <PendingRow />
              </>
            ) : (
              pages.map((page) => <PageRow key={page.id} page={page} />)
            )}
          </Frame.Panel>
        </Frame>
      ))}
    </SettingsPage>
  );
}
