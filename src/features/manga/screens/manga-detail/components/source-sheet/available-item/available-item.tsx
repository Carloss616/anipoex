import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import type { Source } from "@/features/manga/utils/source";
import { useMatchUrl } from "../hooks/use-match-url";
import { useSearching } from "../hooks/use-searching";
import type { SourceActions } from "../hooks/use-source-actions";
import { useSourceScan } from "../hooks/use-source-scan";
import { Rail } from "../rail";
import { RefreshIcon } from "../refresh-icon";
import { Tile } from "../tile";
import {
  errorDialog,
  excludeMenu,
  searchItem,
  statusDetail,
} from "../utils/row-content";
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
  const searching = useSearching(mangaKey, source.id);
  const searchIcon = searching ? Icons.searchTitlesOff : Icons.searchTitles;
  const url = useMatchUrl(mangaKey, source.id);
  const items: MenuItem[] = [
    { ...searchItem(source, searching, actions), icon: searchIcon },
    ...(url || source.homeUrl
      ? [
          {
            label: "Open website",
            icon: Icons.website,
            onPress: () => actions.openWebsite(source, url),
          },
        ]
      : []),
    ...(error
      ? [
          {
            label: "See error",
            icon: Icons.error,
            onPressMode: "dialog" as const,
            dialogConfig: errorDialog(source.name, error),
            onPress: () => actions.rescan(source.id),
          },
        ]
      : []),
    ...(selected
      ? [
          {
            label: "Deselect",
            icon: Icons.deselect,
            onPress: () => actions.deselect(source.id),
          },
        ]
      : []),
    {
      ...excludeMenu(suspicious, (reason) =>
        actions.exclude(source.id, reason),
      ),
      icon: Icons.exclude,
    },
  ];

  return (
    <View>
      <View>
        <Item
          onPress={() => onSelect(source.id)}
          aria-selected={selected}
          data-ring="inset"
          className={selected ? "pe-34" : "pe-27.5"}
        >
          <Item.Media>
            <Tile source={source} />
          </Item.Media>
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
        {/* Over the row, not in it: a <button> can't hold buttons. */}
        <Item.Actions className="absolute inset-e-4 inset-y-0">
          {/* A mark, not an action: a disabled button only for the same box as ↻ and ⋯, undimmed, and hidden since the row says aria-selected. */}
          {selected && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 opacity-100"
              disabled
              aria-hidden
              accessibilityLabel="Selected"
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
        </Item.Actions>
      </View>
      <Rail
        mangaKey={mangaKey}
        mangaId={Number(mangaKey)}
        source={source}
        actions={actions}
      />
    </View>
  );
});
