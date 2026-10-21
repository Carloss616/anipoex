import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import type { SourceActions } from "../hooks/use-source-actions";
import { useSourceScan } from "../hooks/use-source-scan";
import { RefreshIcon } from "../refresh-icon";
import { Tile } from "../tile";
import { errorDialog, excludeMenu, statusDetail } from "../utils/row-content";
import { sourceStatus } from "../utils/source-status";

/** What the iOS swipe hands the sheet's reason dialog. */
export type ExcludeRequest = { source: Source; suspicious: boolean };

/** What an iOS context menu's See error hands the sheet's dialog. */
export type ErrorRequest = { source: Source; error: string; excluded?: true };

export interface AvailableItemProps {
  source: Source;
  mangaKey: string;
  /** Every installed source: whether this one is suspicious depends on the rest. */
  sources: Source[];
  read: number;
  /** When the sheet opened: the probe ages count from it. */
  openedAt: number;
  selected: boolean;
  actions: SourceActions;
  onSelect: (id: string) => void;
  /** iOS: the swipe's Exclude asks for a reason in the sheet's dialog. */
  onExclude?: (row: ExcludeRequest) => void;
  /** iOS: See error shows the message in the sheet's dialog. */
  onError?: (row: ErrorRequest) => void;
  /** Android: the long-press menu is open on this row. */
  menuOpen?: boolean;
  onMenu?: (id: string | null) => void;
}

export const AvailableItem = memo(function AvailableItem({
  source,
  mangaKey,
  sources,
  read,
  openedAt,
  selected,
  actions,
  onSelect,
}: AvailableItemProps) {
  const { probe, scanning, suspicious } = useSourceScan(
    mangaKey,
    source.id,
    sources,
  );
  const status = sourceStatus(
    probe,
    read,
    FAR_BEHIND_GAP,
    suspicious,
    openedAt,
  );
  const detail = statusDetail(status);
  // The last read's failure, hidden while the source is read again.
  const error = scanning ? undefined : probe?.error;
  const items: MenuItem[] = [
    ...(error
      ? [
          {
            label: "See error",
            onPressMode: "dialog" as const,
            dialogConfig: errorDialog(source.name, error),
            onPress: () => actions.rescan(source.id),
          },
        ]
      : []),
    // The selected source can't be excluded.
    ...(selected
      ? []
      : [
          excludeMenu(suspicious, (reason) =>
            actions.exclude(source.id, reason),
          ),
        ]),
  ];

  // Siblings, not nested: the row and its trailing actions are all <button>s on web. Same spacing as one Item with its Actions.
  return (
    <View className="flex-row items-center gap-3 pe-4">
      <Item
        onPress={() => onSelect(source.id)}
        aria-selected={selected}
        className="flex-1 pe-0"
      >
        <Tile source={source} />
        <Item.Content>
          <Item.Title>{source.baseName ?? source.name}</Item.Title>
          <Item.Description numberOfLines={1}>
            {source.lang && (
              <Badge className="mr-1.5">{source.lang.toUpperCase()}</Badge>
            )}
            {scanning ? (
              <Badge>scanning…</Badge>
            ) : (
              <Badge color={status.color}>{status.label}</Badge>
            )}
            {detail !== "" && ` ${detail}`}
          </Item.Description>
        </Item.Content>
      </Item>
      <Item.Actions>
        {/* A mark, not an action: a disabled button only for the same box as ↻ and ⋯, undimmed, and hidden since the row says aria-selected. */}
        {selected && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 opacity-100"
            disabled
            aria-hidden
          >
            <Icon
              name={Icons.check}
              size={BUTTON_ICON_SIZE}
              className="text-primary"
            />
          </Button>
        )}
        {/* Off only while this source scans: rescans of other rows run beside it. */}
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          disabled={scanning}
          onPress={() => actions.rescan(source.id)}
          accessibilityLabel={`Rescan ${source.name}`}
        >
          <RefreshIcon spinning={scanning} />
        </Button>
        {items.length > 0 && (
          <Menu items={items}>
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
      </Item.Actions>
    </View>
  );
});
