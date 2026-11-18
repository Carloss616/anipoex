import { router } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Tabs } from "panelui-web/tabs";
import { memo } from "react";
import { View } from "react-native";
import { Icon, Icons } from "@/components/ui/icon";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { ListKey } from "@/features/manga/utils/parse-list";
import type { CustomList, ListCounts } from "@/features/manga/utils/to-counts";

const openCustomLists = () => router.push("/manga/custom-lists");

/** Web: the lists as tab columns with totals; the grid is their panel. */
export const ListSidebar = memo(function ListSidebar({
  status,
  counts,
  customLists,
  onSelect,
  className,
}: {
  status: ListKey;
  counts: ListCounts;
  customLists: CustomList[] | null;
  onSelect: (key: ListKey) => void;
  className?: string;
}) {
  const select = (value: unknown) => onSelect(value as ListKey);

  return (
    <View className={cn("gap-0.5", className)}>
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Lists
      </Typography>
      <Tabs orientation="vertical" value={status} onValueChange={select}>
        <Tabs.List className="w-full">
          {MANGA_STATUS_ENTRIES.map(([key, name]) => (
            <Tabs.Trigger key={key} value={key} className="w-full">
              {name}
              {counts[key] != null && (
                <Tabs.Badge className="ms-auto">{counts[key]}</Tabs.Badge>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      <View className="flex-row items-center justify-between ps-4.25 pe-2 pt-4 pb-1">
        <Typography type="body-sm" muted>
          Custom lists
        </Typography>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label="Manage lists"
          onClick={openCustomLists}
        >
          <Icon name={Icons.listEdit} />
        </Button>
      </View>
      {!!customLists?.length && (
        <Tabs orientation="vertical" value={status} onValueChange={select}>
          <Tabs.List className="w-full">
            {customLists.map(({ key, name, count }) => (
              <Tabs.Trigger key={key} value={key} className="w-full">
                <Typography type="body-sm" className="truncate text-inherit">
                  {name}
                </Typography>
                <Tabs.Badge className="ms-auto">{count}</Tabs.Badge>
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
      )}
    </View>
  );
});
