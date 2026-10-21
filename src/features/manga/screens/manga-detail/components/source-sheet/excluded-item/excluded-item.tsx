import { Computed } from "@legendapp/state/react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Item } from "@/components/ui/item";
import { isScanBusy } from "@/features/manga/state/probes";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import type { SourceActions } from "../hooks/use-source-actions";
import { Tile } from "../tile";
import { excludedBadge } from "../utils/row-content";

export interface ExcludedItemProps {
  source: Source;
  reason: ExcludeReason;
  pinned: boolean;
  mangaKey: string;
  actions: SourceActions;
}

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  return (
    <Item>
      <Tile source={source} />
      <Item.Content>
        <Item.Title>{source.name}</Item.Title>
        <Item.Description numberOfLines={1}>
          <Badge color={REASONS[reason].color}>
            {excludedBadge(reason, pinned)}
          </Badge>
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <Computed>
          {() => (
            <Button
              variant="ghost"
              size="sm"
              disabled={isScanBusy(mangaKey)}
              onPress={() => actions.include(source.id)}
              accessibilityLabel={`Include ${source.name}`}
            >
              Include
            </Button>
          )}
        </Computed>
      </Item.Actions>
    </Item>
  );
});
