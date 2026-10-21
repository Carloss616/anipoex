import {
  Box,
  Column,
  HorizontalDivider,
  IconButton,
  LazyColumn,
  Row,
  Spacer,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  padding,
  selectableGroup,
  semantics,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { useState } from "react";
import type { ColorValue } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { AvailableItem } from "./available-item";
import { ExcludedItem } from "./excluded-item";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSources } from "./hooks/use-sources";
import { RefreshIcon } from "./refresh-icon";
import type { SourceSheetProps } from "./source-sheet";
import { excludedMenuItems } from "./utils/row-content";
import { sheetItemKey, sheetItems } from "./utils/sheet-items";

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
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id, isPresented });
  const actions = useSourceActions({ manga, read, selectedId });
  const [menuId, setMenuId] = useState<string | null>(null);
  const m3 = useThemeM3Colors();

  const items = sheetItems(available, excluded);

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
        <Computed>
          {() => {
            const items = excludedMenuItems(excluded, isScanBusy(key), actions);
            return (
              <Menu items={items}>
                <MoreButton color={m3.onSurfaceVariant} />
              </Menu>
            );
          }}
        </Computed>
      </Row>
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
              <Computed>
                {() => (
                  <IconButton
                    enabled={!isScanBusy(key)}
                    onClick={actions.scanAll}
                    colors={{ contentColor: m3.onSurfaceVariant }}
                    modifiers={[
                      semantics({ contentDescription: "Scan all sources" }),
                    ]}
                  >
                    <RefreshIcon spinning={scanningAll$[key].get() === true} />
                  </IconButton>
                )}
              </Computed>
            </Row>
            <Text
              style={{ typography: "bodyMedium" }}
              color={m3.onSurfaceVariant}
            >
              {read > 0 ? `Read c.${read}` : "Not started"}
            </Text>
          </Column>
          <SearchBar
            defaultValue={query}
            debounce={150}
            onDebouncedChange={setQuery}
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
                item.kind === "header" ? (
                  header(item.id)
                ) : (
                  <Column>
                    {!item.first && (
                      <HorizontalDivider
                        modifiers={[padding(GUTTER, 0, GUTTER, 0)]}
                      />
                    )}
                    {item.kind === "available" ? (
                      <AvailableItem
                        source={item.row.source}
                        mangaKey={key}
                        sources={all}
                        read={read}
                        openedAt={openedAt}
                        selected={item.row.source.id === selectedId}
                        menuOpen={menuId === item.row.source.id}
                        actions={actions}
                        onSelect={onSelect}
                        onMenu={setMenuId}
                      />
                    ) : (
                      <ExcludedItem
                        source={item.row.source}
                        reason={item.row.reason}
                        pinned={item.row.pinned}
                        mangaKey={key}
                        actions={actions}
                      />
                    )}
                  </Column>
                )
              }
            </LazyColumn.Items>
          </LazyColumn>
        )}
      </Column>
    </BottomSheet>
  );
}
