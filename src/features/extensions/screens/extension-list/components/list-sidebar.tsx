import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Tabs } from "panelui-web/tabs";
import { View } from "react-native";
import {
  EXTENSION_FILTERS,
  type ExtensionCounts,
  type ExtensionFilter,
  FILTER_TITLES,
} from "@/features/extensions";

/** As the manga `ListSidebar`: the filters as tabs with their totals. */
export function ListSidebar({
  filter,
  counts,
  onSelect,
  className,
}: {
  filter: ExtensionFilter;
  counts: ExtensionCounts;
  onSelect: (filter: ExtensionFilter) => void;
  className?: string;
}) {
  return (
    <View className={cn("gap-0.5", className)}>
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Filters
      </Typography>
      <Tabs
        orientation="vertical"
        value={filter}
        onValueChange={(value) => onSelect(value as ExtensionFilter)}
      >
        <Tabs.List className="w-full">
          {EXTENSION_FILTERS.map((f) => (
            <Tabs.Trigger key={f} value={f} className="w-full">
              {FILTER_TITLES[f]}
              <Tabs.Badge className="ms-auto">{counts[f]}</Tabs.Badge>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    </View>
  );
}
