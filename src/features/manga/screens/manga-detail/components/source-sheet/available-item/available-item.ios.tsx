import {
  Button,
  ContextMenu,
  HStack,
  Label,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityHidden,
  buttonStyle,
  disabled,
  foregroundStyle,
  frame,
  lineLimit,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BUTTON_ICON_SIZE, Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { FAR_BEHIND_GAP } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSearching } from "../hooks/use-searching";
import { useSourceScan } from "../hooks/use-source-scan";
import { Rail } from "../rail";
import { Tile } from "../tile";
import { excludeMenu, searchItem, statusDetail } from "../utils/row-content";
import { sourceStatus } from "../utils/source-status";
import type { AvailableItemProps } from "./available-item";

export const AvailableItem = memo(function AvailableItem({
  source,
  mangaKey,
  sources,
  read,
  openedAt,
  selected,
  actions,
  onSelect,
  onExclude,
  onError,
}: AvailableItemProps) {
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);
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
  const search = searchItem(source, searching, actions);
  // Off only while this source scans: rescans of other rows run beside it.
  const rescan = (
    <Button
      label="Rescan"
      systemImage={sfSymbol(Icons.refresh)}
      modifiers={[disabled(scanning)]}
      onPress={() => actions.rescan(source.id)}
    />
  );

  return (
    <SwipeActions>
      <VStack alignment="leading" spacing={10}>
        <ContextMenu>
          <ContextMenu.Items>
            <Button
              label={search.label}
              systemImage={sfSymbol(Icons.searchTitles)}
              onPress={search.onPress}
            />
            {rescan}
            {error && (
              <Button
                label="See error"
                systemImage="exclamationmark.triangle"
                onPress={() => onError?.({ source, error })}
              />
            )}
            {selected && (
              <Button
                label="Deselect"
                systemImage="xmark.circle"
                onPress={() => actions.deselect(source.id)}
              />
            )}
            {/* Inside a context menu, a menu is its submenu row. */}
            <Menu
              items={
                excludeMenu(suspicious, (reason) =>
                  actions.exclude(source.id, reason),
                ).items
              }
            >
              <Label title="Exclude" systemImage="eye.slash" />
            </Menu>
          </ContextMenu.Items>
          <ContextMenu.Trigger>
            <Button
              onPress={() => onSelect(source.id)}
              modifiers={[
                buttonStyle("plain"),
                accessibilityAddTraits(selected ? ["isSelected"] : []),
              ]}
            >
              {/* A plain button only takes touches on its label, so the label fills the row. */}
              <HStack modifiers={ROW_FILL}>
                <Label icon={<Tile source={source} />}>
                  <VStack alignment="leading" spacing={2}>
                    <Text weight="medium" modifiers={[lineLimit(1)]}>
                      {source.baseName ?? source.name}
                    </Text>
                    <HStack spacing={6}>
                      {source.lang && (
                        <Badge>{source.lang.toUpperCase()}</Badge>
                      )}
                      {scanning ? (
                        <Badge>scanning…</Badge>
                      ) : (
                        <Badge color={status.color}>{status.label}</Badge>
                      )}
                      {detail !== "" && (
                        <Text
                          textStyle="subheadline"
                          modifiers={[
                            foregroundStyle("secondary"),
                            lineLimit(1),
                          ]}
                        >
                          {detail}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                </Label>
                <Spacer />
                {/* A fixed slot, so the name and badge never shift; hidden, as the row already reads its trait and `scanning…`. */}
                <HStack
                  modifiers={[
                    frame({ width: BUTTON_ICON_SIZE }),
                    accessibilityHidden(true),
                  ]}
                >
                  {scanning ? (
                    <Loader size="sm" />
                  ) : selected ? (
                    <Icon
                      name={Icons.check}
                      size={BUTTON_ICON_SIZE}
                      color={primary}
                    />
                  ) : null}
                </HStack>
              </HStack>
            </Button>
          </ContextMenu.Trigger>
        </ContextMenu>
        <Rail
          mangaKey={mangaKey}
          mangaId={Number(mangaKey)}
          source={source}
          actions={actions}
        />
      </VStack>
      {/* Right edge: search and rescan. No full swipe on either edge: a long drag shouldn't start one. */}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button
          label={searching ? "Stop" : "Search"}
          systemImage={sfSymbol(Icons.searchTitles)}
          modifiers={[tint(primary)]}
          onPress={search.onPress}
        />
        {rescan}
      </SwipeActions.Actions>
      {/* Left edge: exclude. */}
      <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
        <Button
          label="Exclude"
          systemImage="eye.slash"
          // No destructive role: SwiftUI would delete the row before a reason is picked.
          modifiers={[tint(destructive)]}
          onPress={() => onExclude?.({ source, suspicious })}
        />
      </SwipeActions.Actions>
    </SwipeActions>
  );
});
