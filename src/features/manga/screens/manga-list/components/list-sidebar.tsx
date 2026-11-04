import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Tabs } from "panelui-web/tabs";
import { memo } from "react";
import { View } from "react-native";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { ListCounts } from "@/features/manga/utils/to-counts";
import type { MediaListStatus } from "@/graphql/types.generated";

/** Web: the lists as a column of tabs with their totals; the grid is their panel. */
export const ListSidebar = memo(function ListSidebar({
  status,
  counts,
  onSelect,
  className,
}: {
  status: MediaListStatus;
  counts: ListCounts;
  onSelect: (status: MediaListStatus) => void;
  className?: string;
}) {
  return (
    <View className={cn("gap-0.5", className)}>
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Lists
      </Typography>
      <Tabs
        orientation="vertical"
        value={status}
        onValueChange={(value) => onSelect(value as MediaListStatus)}
      >
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
    </View>
  );
});
