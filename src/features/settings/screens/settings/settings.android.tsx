import { Column } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import { SEGMENTED_GAP } from "@/components/native/jetpack-compose/segmented-list-item";
import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "@/features/settings/components/account-section";
import { Label } from "@/features/settings/components/label";
import { SettingsPage } from "@/features/settings/components/settings-page";
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

  return (
    <SettingsPage title="Settings">
      <AccountSection onPress={() => router.push("/settings/account")} />
      {GROUPS.map(({ group, title, pages }) => (
        <Column key={group}>
          <Label>{title}</Label>
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            {group === "status" ? (
              <>
                <ActivityRow index={0} count={2} />
                <PendingRow index={1} count={2} />
              </>
            ) : (
              pages.map((page, i) => (
                <PageRow
                  key={page.id}
                  page={page}
                  index={i}
                  count={pages.length}
                />
              ))
            )}
          </Column>
        </Column>
      ))}
    </SettingsPage>
  );
}
