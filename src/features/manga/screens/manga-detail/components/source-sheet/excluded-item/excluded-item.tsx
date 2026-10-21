import { Computed, useValue } from "@legendapp/state/react";
import { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu } from "@/components/ui/menu";
import { isScanBusy, probes$ } from "@/features/manga/state/probes";
import { type ExcludeReason, REASONS } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import type { ErrorRequest } from "../available-item";
import type { SourceActions } from "../hooks/use-source-actions";
import { Tile } from "../tile";
import { errorDialog, excludedBadge } from "../utils/row-content";

export interface ExcludedItemProps {
  source: Source;
  reason: ExcludeReason;
  pinned: boolean;
  mangaKey: string;
  actions: SourceActions;
  /** iOS: See error shows the message in the sheet's dialog. */
  onError?: (row: ErrorRequest) => void;
}

export const ExcludedItem = memo(function ExcludedItem({
  source,
  reason,
  pinned,
  mangaKey,
  actions,
}: ExcludedItemProps) {
  const error = useValue(() => probes$[mangaKey][source.id].error.get());
  return (
    <Item>
      <Tile source={source} />
      <Item.Content>
        <Item.Title>{source.baseName ?? source.name}</Item.Title>
        <Item.Description numberOfLines={1}>
          {source.lang && (
            <Badge className="mr-1.5">{source.lang.toUpperCase()}</Badge>
          )}
          <Badge color={REASONS[reason].color}>
            {excludedBadge(reason, pinned)}
          </Badge>
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        {error && (
          <Menu
            items={[
              {
                label: "See error",
                onPressMode: "dialog",
                dialogConfig: errorDialog(source.name, error, true),
                onPress: () => actions.include(source.id),
              },
            ]}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              accessibilityLabel={`More actions for ${source.name}`}
            >
              <Icon
                name={Icons.more}
                size={BUTTON_ICON_SIZE}
                className="text-foreground"
              />
            </Button>
          </Menu>
        )}
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
