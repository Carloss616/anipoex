import { Typography } from "panelui-native/components/typography";
import { Tabs } from "panelui-web/tabs";
import { View } from "react-native";
import {
  EXTENSION_FILTERS,
  type ExtensionCounts,
  type ExtensionFilter,
  FILTER_TITLES,
} from "@/features/extensions";

/** Same column as the manga `ListSidebar`: the filters as tabs with their totals. */
export function ListSidebar({
  filter,
  counts,
  onSelect,
}: {
  filter: ExtensionFilter;
  counts: ExtensionCounts;
  onSelect: (filter: ExtensionFilter) => void;
}) {
  return (
    <View className="gutters box-content w-48 flex-1 gap-0.5 border-border border-r p-4 pb-gb pl-gx">
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
