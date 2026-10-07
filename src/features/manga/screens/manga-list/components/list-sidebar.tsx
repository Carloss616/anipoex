import { ButtonGroup } from "panelui-native/components/button-group";
import { cn } from "panelui-native/utils/cn";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { ListCounts } from "@/features/manga/utils/to-counts";
import type { MediaListStatus } from "@/graphql/types.generated";

/**
 * Web: the lists as a column, with their totals. They switch what the same view
 * shows, so they are tabs: a `link` role would make the web expect a real href.
 */
export const ListSidebar = memo(function ListSidebar({
  status,
  counts,
  onSelect,
}: {
  status: MediaListStatus;
  counts: ListCounts;
  onSelect: (status: MediaListStatus) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="gutters box-content w-48 gap-0.5 border-border border-r p-4 pb-gb pl-gx"
    >
      <Typography type="body-sm" muted className="px-4.25 pb-2.5">
        Lists
      </Typography>
      <ButtonGroup orientation="vertical">
        {MANGA_STATUS_ENTRIES.map(([key, name]) => {
          const selected = key === status;
          return (
            <Button
              key={key}
              accessibilityRole="tab"
              aria-selected={selected}
              onPress={() => onSelect(key)}
              variant={selected ? "secondary" : "ghost"}
              className={cn("justify-between", !selected && "opacity-60!")}
            >
              {name}
              <Badge>{counts[key]}</Badge>
            </Button>
          );
        })}
      </ButtonGroup>
    </View>
  );
});
