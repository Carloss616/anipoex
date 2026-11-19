import { usePathname } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Tabs } from "panelui-web/tabs";
import { View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { PendingBadge } from "@/features/activity/components/pending-badge";
import { isRuntimeAvailable } from "@/features/extensions";
import { PAGE_ICONS } from "@/features/settings/utils/page-details";
import {
  groupPages,
  pageForPath,
  SETTINGS_PAGES,
  type SettingsPage,
  visiblePages,
} from "@/features/settings/utils/settings-pages";
import { openPage } from "./utils";

const LISTS = [
  {
    group: "account",
    title: undefined,
    pages: SETTINGS_PAGES.filter((page) => !page.group),
  },
  ...groupPages(visiblePages(isRuntimeAvailable)),
];

/** The pages as Extensions' `ListSidebar` draws its filters. */
export function SettingsSidebar() {
  // The index shows Account beside the sidebar.
  const active = pageForPath(usePathname()) ?? "account";

  return (
    <View className="gap-4">
      {LISTS.map(({ group, title, pages }) => (
        <View key={group} className="gap-0.5">
          {title && (
            <Typography type="body-sm" muted className="px-4.25 pb-2.5">
              {title}
            </Typography>
          )}
          <PageTabs pages={pages} active={active} />
        </View>
      ))}
    </View>
  );
}

function PageTabs({
  pages,
  active,
}: {
  pages: SettingsPage[];
  active: string;
}) {
  return (
    <Tabs
      orientation="vertical"
      value={pages.some((page) => page.id === active) ? active : null}
      onValueChange={(id) => {
        const page = pages.find((p) => p.id === id);
        if (page) openPage(page.href);
      }}
    >
      <Tabs.List className="w-full">
        {pages.map((page) => (
          <Tabs.Trigger key={page.id} value={page.id} className="w-full">
            <Icon name={PAGE_ICONS[page.id]} size={16} />
            {page.title}
            {page.id === "activity" && <PendingBadge className="ms-auto" />}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
