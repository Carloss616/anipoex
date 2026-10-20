import {
  Box,
  Column,
  DropdownMenu,
  DropdownMenuItem,
  HorizontalDivider,
  IconButton,
  LazyColumn,
  ListItem,
  RadioButton,
  Row,
  Spacer,
  TextButton,
} from "@expo/ui/jetpack-compose";
import {
  clickable,
  combinedClickable,
  fillMaxWidth,
  height,
  padding,
  selectableGroup,
  semantics,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import type { ColorValue } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Menu, type MenuItem } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { SourceTile } from "@/features/manga/components/source-tile";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSources } from "./hooks/use-sources";
import type { SourceSheetProps } from "./source-sheet";
import {
  excludedBadge,
  excludeReasons,
  RESET_DIALOG,
  statusDetail,
} from "./utils/row-content";
import { sheetItemKey, sheetItems } from "./utils/sheet-items";
import { sourceStatus } from "./utils/source-status";
import type { ExcludedRow, SourceRow } from "./utils/split-sources";

const EMPTY_HEIGHT = 320;

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({
  color,
  onPress,
}: {
  color: ColorValue;
  onPress?: () => void;
}) {
  return (
    <IconButton
      onClick={onPress}
      colors={{ contentColor: color }}
      modifiers={[
        semantics({ contentDescription: "Excluded sources actions" }),
      ]}
    >
      <Icon name={Icons.more} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

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
  const [menuId, setMenuId] = useState<string | null>(null);
  const m3 = useThemeM3Colors();
  const now = Date.now();

  // The loader takes the icon's place at the icon's 24dp, so the button never shifts.
  const refreshIcon = (spinning: boolean) =>
    spinning ? (
      <Loader size="sm" />
    ) : (
      <Icon name={Icons.refresh} size={BUTTON_ICON_SIZE} color="inherit" />
    );

  const runFromMenu = (action: () => void) => () => {
    setMenuId(null);
    action();
  };
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
  const items = sheetItems(available, excluded);
  const divider = (first: boolean) =>
    !first && <HorizontalDivider modifiers={[padding(GUTTER, 0, GUTTER, 0)]} />;

  const header = (id: "available" | "no-sources" | "excluded") =>
    id === "no-sources" ? (
      <Text
        style={{ typography: "bodyMedium" }}
        color={m3.onSurfaceVariant}
        modifiers={[padding(GUTTER, 8, GUTTER, 8)]}
      >
        No sources
      </Text>
    ) : id === "available" ? (
      <Text
        style={{ typography: "titleSmall" }}
        color={m3.primary}
        modifiers={[padding(GUTTER, 8, GUTTER, 0)]}
      >
        Available
      </Text>
    ) : (
      <Row
        verticalAlignment="center"
        horizontalArrangement={{ spacedBy: 8 }}
        modifiers={[padding(GUTTER, 8, 4, 0)]}
      >
        <Text style={{ typography: "titleSmall" }} color={m3.primary}>
          Excluded
        </Text>
        <Badge>{excluded.length}</Badge>
        <Spacer modifiers={[weight(1)]} />
        <Menu items={excludedItems}>
          <MoreButton color={m3.onSurfaceVariant} />
        </Menu>
      </Row>
    );

  const availableRow = (row: SourceRow, first: boolean) => {
    const { source } = row;
    const isSelected = source.id === selectedId;
    const select = () => onSelect(source.id);
    const status = sourceStatus(
      row.probe,
      read,
      FAR_BEHIND_GAP,
      row.suspicious,
      now,
    );
    const detail = statusDetail(status);

    const item = (
      <ListItem
        colors={{ containerColor: "transparent" }}
        modifiers={[
          combinedClickable({
            onClick: select,
            // The selected source can't be excluded, so its long-press has no menu.
            onLongClick: isSelected ? undefined : () => setMenuId(source.id),
          }),
        ]}
      >
        <ListItem.LeadingContent>
          <SourceTile
            initials={source.initials}
            iconUrl={source.iconUrl}
            color={sourceColor(source, mode)}
          />
        </ListItem.LeadingContent>
        <ListItem.HeadlineContent>
          <Text style={{ fontWeight: "500" }}>{source.name}</Text>
        </ListItem.HeadlineContent>
        <ListItem.SupportingContent>
          <Row
            verticalAlignment="center"
            horizontalArrangement={{ spacedBy: 6 }}
          >
            {actions.scanning.has(source.id) ? (
              <Badge>scanning…</Badge>
            ) : (
              <Badge color={status.color}>{status.label}</Badge>
            )}
            {detail !== "" && (
              <Text
                style={{ typography: "bodySmall" }}
                color={m3.onSurfaceVariant}
                maxLines={1}
                overflow="ellipsis"
              >
                {detail}
              </Text>
            )}
          </Row>
        </ListItem.SupportingContent>
        <ListItem.TrailingContent>
          <Row verticalAlignment="center">
            {/* Its own click, consumed before the row's, so rescanning never selects. */}
            <IconButton
              enabled={!busy}
              onClick={() => actions.rescan(source.id)}
              colors={{ contentColor: m3.onSurfaceVariant }}
              modifiers={[
                // A disabled button passes the tap to the row; this outer no-op takes it on the same node, so TalkBack still reads one disabled button.
                ...(busy ? [clickable(() => {}, { indication: false })] : []),
                semantics({ contentDescription: `Rescan ${source.name}` }),
              ]}
            >
              {refreshIcon(actions.scanning.has(source.id))}
            </IconButton>
            {/* Its own click, so TalkBack still finds a radio next to the row's long-press. */}
            <RadioButton selected={isSelected} onClick={select} />
          </Row>
        </ListItem.TrailingContent>
      </ListItem>
    );

    return (
      <Column>
        {divider(first)}
        {isSelected ? (
          item
        ) : (
          <DropdownMenu
            expanded={menuId === source.id}
            onDismissRequest={() => setMenuId(null)}
            modifiers={[fillMaxWidth()]}
          >
            <DropdownMenu.Trigger>{item}</DropdownMenu.Trigger>
            <DropdownMenu.Items>
              {excludeReasons(row.suspicious).map((reason) => (
                <DropdownMenuItem
                  key={reason}
                  onClick={runFromMenu(() =>
                    actions.exclude(source.id, reason),
                  )}
                >
                  <DropdownMenuItem.Text>
                    <Text style={{ typography: "labelLarge" }}>
                      {`Exclude: ${REASONS[reason].menu}`}
                    </Text>
                  </DropdownMenuItem.Text>
                </DropdownMenuItem>
              ))}
            </DropdownMenu.Items>
          </DropdownMenu>
        )}
      </Column>
    );
  };

  const excludedRow = (row: ExcludedRow, first: boolean) => (
    <Column>
      {divider(first)}
      <ListItem colors={{ containerColor: "transparent" }}>
        <ListItem.LeadingContent>
          <SourceTile
            initials={row.source.initials}
            iconUrl={row.source.iconUrl}
            color={sourceColor(row.source, mode)}
          />
        </ListItem.LeadingContent>
        <ListItem.HeadlineContent>
          <Text style={{ fontWeight: "500" }}>{row.source.name}</Text>
        </ListItem.HeadlineContent>
        <ListItem.SupportingContent>
          <Row>
            <Badge color={REASONS[row.reason].color}>
              {excludedBadge(row.reason, row.pinned)}
            </Badge>
          </Row>
        </ListItem.SupportingContent>
        <ListItem.TrailingContent>
          <TextButton
            enabled={!busy}
            onClick={() => actions.include(row.source.id)}
          >
            <Text style={{ typography: "labelLarge" }}>Include</Text>
          </TextButton>
        </ListItem.TrailingContent>
      </ListItem>
    </Column>
  );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${available.length}-${excluded.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <Column
        verticalArrangement={{ spacedBy: 16 }}
        modifiers={[padding(0, 0, 0, GUTTER)]}
      >
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
        >
          <Column>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
            >
              <Text style={{ typography: "titleLarge" }}>Sources</Text>
              {/* M3's badge reads high against a centered title. */}
              <Box modifiers={[padding(0, 4, 0, 0)]}>
                <Badge>{available.length}</Badge>
              </Box>
              <Spacer modifiers={[weight(1)]} />
              <IconButton
                enabled={!busy}
                onClick={actions.scanAll}
                colors={{ contentColor: m3.onSurfaceVariant }}
                modifiers={[
                  semantics({ contentDescription: "Scan all sources" }),
                ]}
              >
                {refreshIcon(scanningAll)}
              </IconButton>
            </Row>
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurfaceVariant}
            >
              {read > 0 ? `Read c.${read}` : "Not started"}
            </Text>
          </Column>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            shape="pill"
          />
        </Column>

        {items.length === 0 ? (
          // A fixed height, not the sheet's: centred in the full sheet it sits below the half snap.
          <Box modifiers={[fillMaxWidth(), height(EMPTY_HEIGHT)]}>
            {/* Scrolls inside the box, so the description variant never clips silently. */}
            <EmptyState {...empty} modifiers={[verticalScroll()]} />
          </Box>
        ) : (
          // One flat lazy list; the group gives TalkBack the radios' collection, as the old Column did.
          <LazyColumn
            modifiers={[fillMaxWidth(), weight(1), selectableGroup()]}
          >
            <LazyColumn.Items data={items} keyExtractor={sheetItemKey}>
              {({ item }) =>
                item.kind === "header"
                  ? header(item.id)
                  : item.kind === "available"
                    ? availableRow(item.row, item.first)
                    : excludedRow(item.row, item.first)
              }
            </LazyColumn.Items>
          </LazyColumn>
        )}
      </Column>
    </BottomSheet>
  );
}
