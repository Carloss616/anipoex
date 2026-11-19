import { Section } from "@expo/ui/swift-ui";
import { useRouter } from "expo-router";
import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "@/features/settings/components/account-section";
import { SettingsPage } from "@/features/settings/components/settings-page";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import {
  groupPages,
  visiblePages,
} from "@/features/settings/utils/settings-pages";
import { ActivityRow } from "./components/activity-row";
import { PageRow } from "./components/page-row";
import { PendingRow } from "./components/pending-row";

const GROUPS = groupPages(visiblePages(isRuntimeAvailable));

export function Settings() {
  useLoadInstalled();
  const router = useRouter();
  const rowBackground = useRowBackground();

  return (
    <SettingsPage title="Settings" large>
      <AccountSection onPress={() => router.push("/settings/account")} />
      {GROUPS.map(({ group, title, pages }) => (
        <Section key={group} modifiers={[rowBackground]} title={title}>
          {group === "status" ? (
            <>
              <ActivityRow />
              <PendingRow />
            </>
          ) : (
            pages.map((page) => <PageRow key={page.id} page={page} />)
          )}
        </Section>
      ))}
    </SettingsPage>
  );
}
