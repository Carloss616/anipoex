import { ButtonGroup } from "panelui-native/components/button-group";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  EXTENSION_FILTERS,
  type ExtensionCounts,
  type ExtensionFilter,
  FILTER_TITLES,
} from "@/features/extensions";

/** Same column as the manga `ListSidebar`: tabs, since they switch one view. */
export function FilterSidebar({
  filter,
  counts,
  onSelect,
}: {
  filter: ExtensionFilter;
  counts: ExtensionCounts;
  onSelect: (filter: ExtensionFilter) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="gutters box-content w-48 gap-0.5 border-border border-r p-4 pb-gb pl-gx"
    >
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Filters
      </Typography>
      <ButtonGroup orientation="vertical">
        {EXTENSION_FILTERS.map((f) => {
          const selected = f === filter;
          return (
            <Button
              key={f}
              accessibilityRole="tab"
              aria-selected={selected}
              onPress={() => onSelect(f)}
              variant={selected ? "secondary" : "ghost"}
              className={cn("justify-between", !selected && "opacity-60!")}
            >
              {FILTER_TITLES[f]}
              <Badge>{counts[f]}</Badge>
            </Button>
          );
        })}
      </ButtonGroup>
    </View>
  );
}
