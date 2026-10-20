import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Item } from "@/components/ui/item";
import { Loader } from "@/components/ui/loader";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { Typography } from "@/components/ui/typography";
import { useInstalledSources } from "@/features/extensions";
import { SourceTile } from "@/features/manga/components/source-tile";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { sourceColor } from "@/features/manga/utils/source";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSources } from "./hooks/use-sources";
import {
  excludedBadge,
  excludeReasons,
  RESET_DIALOG,
  statusDetail,
} from "./utils/row-content";
import { type SheetItem, sheetItemKey, sheetItems } from "./utils/sheet-items";
import { sourceStatus } from "./utils/source-status";
import type { ExcludedRow, SourceRow } from "./utils/split-sources";

export interface SourceSheetProps {
  manga: Pick<MangaDetail, "id" | "title" | "synonyms">;
  read: number;
  isPresented: boolean;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}

/**
 * Which source the chapter list reads. A picker confirms by choosing, so it
 * carries no Save — the same way the tracking sheet's fields commit themselves.
 */
export function SourceSheet({
  manga,
  read,
  isPresented,
  selectedId,
  onSelect,
  onDismiss,
}: SourceSheetProps) {
  const { query, setQuery, mode, available, excluded, empty } = useSources({
    mangaId: manga.id,
    isPresented,
  });
  const actions = useSourceActions({ manga, read, selectedId });
  const { busy, scanningAll } = actions;
  const installed = useInstalledSources().length > 0;
  const now = Date.now();

  // Both sections in one list, so they scroll together (both empty: none, and the empty state shows).
  const items = sheetItems(available, excluded);
  const selectedAt = items.findIndex(
    (item) => item.kind === "available" && item.row.source.id === selectedId,
  );

  const excludedItems: MenuItem[] = [
    ...(excluded.some((row) => !row.pinned)
      ? [
          {
            label: "Retry auto-excluded",
            disabled: busy,
            onPress: actions.retryAuto,
          },
        ]
      : []),
    {
      label: "Reset all",
      destructive: true,
      disabled: busy,
      onPressMode: "dialog",
      dialogConfig: RESET_DIALOG,
      onPress: actions.resetAll,
    },
  ];

  // The loader takes the icon's place in the same button, so the row never shifts.
  const refreshIcon = (spinning: boolean) =>
    spinning ? (
      <Loader size="sm" />
    ) : (
      <Icon
        name={Icons.refresh}
        size={BUTTON_ICON_SIZE}
        className="text-foreground"
      />
    );

  const excludeItems = ({ source, suspicious }: SourceRow): MenuItem[] =>
    excludeReasons(suspicious).map((reason) => ({
      label: `Exclude: ${REASONS[reason].menu}`,
      onPress: () => actions.exclude(source.id, reason),
    }));

  const renderHeader = (id: "available" | "no-sources" | "excluded") =>
    id === "available" ? (
      <Typography type="small" className="px-4 text-primary">
        Available
      </Typography>
    ) : id === "no-sources" ? (
      <Typography type="body-sm" muted className="px-4">
        No sources
      </Typography>
    ) : (
      <View className="flex-row items-center gap-2 px-4 pt-4">
        <Typography type="small" className="text-primary">
          Excluded
        </Typography>
        <Badge>{excluded.length}</Badge>
        <View className="flex-1" />
        <Menu items={excludedItems}>
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            accessibilityLabel="Excluded sources actions"
          >
            <Icon
              name={Icons.more}
              size={BUTTON_ICON_SIZE}
              className="text-foreground"
            />
          </Button>
        </Menu>
      </View>
    );

  const renderAvailable = (row: SourceRow) => {
    const { source } = row;
    const isSelected = source.id === selectedId;
    const status = sourceStatus(
      row.probe,
      read,
      FAR_BEHIND_GAP,
      row.suspicious,
      now,
    );
    const detail = statusDetail(status);

    // Siblings, not nested: the row and its trailing actions are all <button>s on web. Same spacing as one Item with its Actions.
    return (
      <View className="flex-row items-center gap-3 pe-4">
        <Item
          onPress={() => onSelect(source.id)}
          aria-selected={isSelected}
          className="flex-1 pe-0"
        >
          <SourceTile
            initials={source.initials}
            iconUrl={source.iconUrl}
            color={sourceColor(source, mode)}
          />
          <Item.Content>
            <Item.Title>{source.name}</Item.Title>
            <Item.Description numberOfLines={1}>
              {actions.scanning.has(source.id) ? (
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
          {isSelected && (
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
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            disabled={busy}
            onPress={() => actions.rescan(source.id)}
            accessibilityLabel={`Rescan ${source.name}`}
          >
            {refreshIcon(actions.scanning.has(source.id))}
          </Button>
          {/* The selected source can't be excluded, so its menu would be empty. */}
          {!isSelected && (
            <Menu items={excludeItems(row)}>
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
  };

  const renderExcluded = (row: ExcludedRow) => (
    <Item>
      <SourceTile
        initials={row.source.initials}
        iconUrl={row.source.iconUrl}
        color={sourceColor(row.source, mode)}
      />
      <Item.Content>
        <Item.Title>{row.source.name}</Item.Title>
        <Item.Description numberOfLines={1}>
          <Badge color={REASONS[row.reason].color}>
            {excludedBadge(row.reason, row.pinned)}
          </Badge>
        </Item.Description>
      </Item.Content>
      <Item.Actions>
        <Button
          variant="ghost"
          size="sm"
          disabled={busy}
          onPress={() => actions.include(row.source.id)}
          accessibilityLabel={`Include ${row.source.name}`}
        >
          Include
        </Button>
      </Item.Actions>
    </Item>
  );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${available.length}-${excluded.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <View className="flex-1 gap-4 py-4">
        <View className="gap-4 px-4">
          <View>
            <View className="flex-row items-center gap-2">
              <Typography type="h4">Sources</Typography>
              <Badge>{available.length}</Badge>
              <View className="flex-1" />
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                // A plain browser has no sources, so nothing to scan.
                disabled={busy || !installed}
                onPress={actions.scanAll}
                accessibilityLabel="Scan all sources"
              >
                {refreshIcon(scanningAll)}
              </Button>
            </View>
            <Typography type="body-sm" muted>
              {read > 0 ? `Read c.${read}` : "Not started"}
            </Typography>
          </View>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </View>

        <LegendList
          data={items}
          keyExtractor={sheetItemKey}
          getItemType={(item: SheetItem) => item.kind}
          extraData={selectedId}
          // Read once, when the sheet opens; typing doesn't move it. No scroll when the selected row is the first one.
          initialScrollIndex={
            selectedAt > 1
              ? { index: selectedAt, viewPosition: 0.5 }
              : undefined
          }
          ListEmptyComponent={<EmptyState {...empty} />}
          renderItem={({ item }) =>
            item.kind === "header" ? (
              renderHeader(item.id)
            ) : (
              <>
                {!item.first && <Item.Separator className="mx-4" />}
                {item.kind === "available"
                  ? renderAvailable(item.row)
                  : renderExcluded(item.row)}
              </>
            )
          }
        />
      </View>
    </BottomSheet>
  );
}
