import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { Tabs } from "panelui-web/tabs";
import { View } from "react-native";

export interface FilterSidebarProps<F extends string> {
  /** Each filter's label, in display order. */
  titles: Record<F, string>;
  /** A filter's total; none or `null` hides its badge. */
  counts: Partial<Record<F, number | null>>;
  /** The selected filter; any other value selects none. */
  value: string;
  onSelect: (filter: F) => void;
  title?: string;
  className?: string;
}

/** Filters as vertical tabs with their totals, beside the list they filter. */
export function FilterSidebar<F extends string>({
  titles,
  counts,
  value,
  onSelect,
  title = "Filters",
  className,
}: FilterSidebarProps<F>) {
  return (
    <View className={cn("gap-0.5", className)}>
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        {title}
      </Typography>
      <Tabs
        orientation="vertical"
        value={value}
        onValueChange={(filter) => onSelect(filter as F)}
      >
        <Tabs.List className="w-full!">
          {(Object.keys(titles) as F[]).map((filter) => (
            <Tabs.Trigger key={filter} value={filter} className="w-full">
              {titles[filter]}
              {counts[filter] != null && (
                <Tabs.Badge className="ms-auto">{counts[filter]}</Tabs.Badge>
              )}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
    </View>
  );
}
