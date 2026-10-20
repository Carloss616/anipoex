import {
  Button,
  ContextMenu,
  HStack,
  Label,
  List,
  Menu,
  ScrollView,
  Section,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  accessibilityHidden,
  accessibilityLabel,
  buttonStyle,
  contentShape,
  defaultScrollAnchorForRole,
  disabled,
  foregroundStyle,
  frame,
  lineLimit,
  listRowBackground,
  listStyle,
  padding,
  scrollContentBackground,
  shapes,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Dialog } from "@/components/ui/dialog";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { SearchBar } from "@/components/ui/search-bar";
import { SourceTile } from "@/features/manga/components/source-tile";
import { FAR_BEHIND_GAP, REASONS } from "@/features/manga/utils/msu";
import { sourceColor } from "@/features/manga/utils/source";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSources } from "./hooks/use-sources";
import type { SourceSheetProps } from "./source-sheet";
import {
  excludedBadge,
  excludeReasons,
  RESET_DIALOG,
  statusDetail,
} from "./utils/row-content";
import { sourceStatus } from "./utils/source-status";
import type { SourceRow } from "./utils/split-sources";

/** A 44pt hit area: a button or menu only takes touches on its label. */
const HIT = [
  frame({ width: 44, height: 44 }),
  contentShape(shapes.rectangle()),
];
// The whole row takes the tap, long-press and swipe, not just its text.
const FILL = [
  frame({ maxWidth: Infinity, alignment: "leading" }),
  contentShape(shapes.rectangle()),
];

function SectionHeader({ children }: { children: string }) {
  return (
    <Text textStyle="footnote" weight="medium">
      {children}
    </Text>
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
  const [excluding, setExcluding] = useState<SourceRow | null>(null);
  const [resetting, setResetting] = useState(false);
  const [primary, destructive, muted] = useThemeColor([
    "primary",
    "destructive",
    "muted",
  ]);
  // Rows as in the extension list: inset-grouped cards on the sheet, default row insets.
  const rowBackground = listRowBackground(muted);
  const now = Date.now();

  const tile = (source: SourceRow["source"]) => (
    <SourceTile
      initials={source.initials}
      iconUrl={source.iconUrl}
      color={sourceColor(source, mode)}
    />
  );

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      contentKey={`${available.length}-${excluded.length}`}
      snapPoints={["half", "full"]}
      snapPointsDirection="bottom"
    >
      <VStack
        alignment="leading"
        spacing={16}
        modifiers={[padding({ vertical: GUTTER })]}
      >
        <VStack
          alignment="leading"
          spacing={16}
          modifiers={[padding({ horizontal: GUTTER })]}
        >
          {/* The reason dialog hangs off the header: `.alert` needs a view that outlives the swiped row. */}
          <Dialog
            alert
            title={`Exclude ${excluding?.source.name ?? ""}`}
            open={excluding !== null}
            onOpenChange={(open) => !open && setExcluding(null)}
            actions={
              excluding
                ? excludeReasons(excluding.suspicious).map((reason) => ({
                    label: REASONS[reason].menu,
                    role: "destructive",
                    onPress: () => actions.exclude(excluding.source.id, reason),
                  }))
                : []
            }
          >
            <Dialog.Trigger>
              <HStack spacing={8}>
                <VStack alignment="leading" spacing={2}>
                  <HStack spacing={8}>
                    <Text textStyle="title3">Sources</Text>
                    <Badge>{available.length}</Badge>
                  </HStack>
                  <Text
                    textStyle="subheadline"
                    modifiers={[foregroundStyle("secondary")]}
                  >
                    {read > 0 ? `Read c.${read}` : "Not started"}
                  </Text>
                </VStack>
                <Spacer />
                <Button
                  onPress={actions.scanAll}
                  modifiers={[
                    buttonStyle("borderless"),
                    disabled(busy),
                    accessibilityLabel("Scan all sources"),
                  ]}
                >
                  {scanningAll ? (
                    // The icon's 44pt slot, so the header never shifts; the button already reads its label.
                    <HStack modifiers={[...HIT, accessibilityHidden(true)]}>
                      <Loader size="sm" />
                    </HStack>
                  ) : (
                    <Icon
                      name={Icons.refresh}
                      size={BUTTON_ICON_SIZE}
                      color="inherit"
                      modifiers={HIT}
                    />
                  )}
                </Button>
              </HStack>
            </Dialog.Trigger>
          </Dialog>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search sources..."
            cancel="focus"
          />
        </VStack>

        {available.length === 0 && excluded.length === 0 ? (
          <ScrollView
            modifiers={[defaultScrollAnchorForRole("center", "alignment")]}
          >
            <EmptyState {...empty} />
          </ScrollView>
        ) : (
          <List
            modifiers={[
              listStyle("insetGrouped"),
              scrollContentBackground("hidden"),
            ]}
          >
            <Section
              modifiers={[rowBackground]}
              header={<SectionHeader>Available</SectionHeader>}
            >
              {available.length === 0 ? (
                <Text modifiers={[foregroundStyle("secondary")]}>
                  No sources
                </Text>
              ) : (
                <List.ForEach
                  data={available}
                  keyExtractor={(row) => row.source.id}
                  // Recycled rows are keyed by slot, so a swipe or menu action could land on another source.
                  recycling={false}
                >
                  {({ item: row }) => {
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

                    return (
                      <SwipeActions>
                        <ContextMenu>
                          <ContextMenu.Items>
                            <Button
                              label="Rescan"
                              systemImage="arrow.clockwise"
                              modifiers={[disabled(busy)]}
                              onPress={() => actions.rescan(source.id)}
                            />
                            {/* The selected source can't be excluded. */}
                            {!isSelected && (
                              <Menu label="Exclude" systemImage="eye.slash">
                                {excludeReasons(row.suspicious).map(
                                  (reason) => (
                                    <Button
                                      key={reason}
                                      label={REASONS[reason].menu}
                                      role="destructive"
                                      onPress={() =>
                                        actions.exclude(source.id, reason)
                                      }
                                    />
                                  ),
                                )}
                              </Menu>
                            )}
                          </ContextMenu.Items>
                          <ContextMenu.Trigger>
                            <Button
                              onPress={() => onSelect(source.id)}
                              modifiers={[
                                buttonStyle("plain"),
                                accessibilityAddTraits(
                                  isSelected ? ["isSelected"] : [],
                                ),
                              ]}
                            >
                              {/* A plain button only takes touches on its label, so the label fills the row. */}
                              <HStack modifiers={FILL}>
                                <Label icon={tile(source)}>
                                  <VStack alignment="leading" spacing={2}>
                                    <Text
                                      weight="medium"
                                      modifiers={[lineLimit(1)]}
                                    >
                                      {source.name}
                                    </Text>
                                    <HStack spacing={6}>
                                      {actions.scanning.has(source.id) ? (
                                        <Badge>scanning…</Badge>
                                      ) : (
                                        <Badge color={status.color}>
                                          {status.label}
                                        </Badge>
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
                                  {actions.scanning.has(source.id) ? (
                                    <Loader size="sm" />
                                  ) : isSelected ? (
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
                        {/* No full swipe: a long drag shouldn't start a scan. */}
                        <SwipeActions.Actions allowsFullSwipe={false}>
                          <Button
                            label="Rescan"
                            systemImage="arrow.clockwise"
                            modifiers={[disabled(busy)]}
                            onPress={() => actions.rescan(source.id)}
                          />
                          {!isSelected && (
                            <Button
                              label="Exclude"
                              systemImage="eye.slash"
                              // No destructive role: SwiftUI would delete the row before a reason is picked.
                              modifiers={[tint(destructive)]}
                              onPress={() => setExcluding(row)}
                            />
                          )}
                        </SwipeActions.Actions>
                      </SwipeActions>
                    );
                  }}
                </List.ForEach>
              )}
            </Section>

            {excluded.length > 0 && (
              <Section
                modifiers={[rowBackground]}
                header={
                  <HStack spacing={12}>
                    <SectionHeader>Excluded</SectionHeader>
                    <Badge>{excluded.length}</Badge>
                    <Spacer />
                    <Dialog
                      {...RESET_DIALOG}
                      alert
                      role="destructive"
                      open={resetting}
                      onOpenChange={setResetting}
                      onConfirm={actions.resetAll}
                    >
                      <Dialog.Trigger>
                        <Menu
                          label={
                            <Icon
                              name={Icons.more}
                              size={BUTTON_ICON_SIZE}
                              color="inherit"
                              modifiers={HIT}
                            />
                          }
                          modifiers={[
                            accessibilityLabel("Excluded sources actions"),
                          ]}
                        >
                          {excluded.some((row) => !row.pinned) && (
                            <Button
                              label="Retry auto-excluded"
                              modifiers={[disabled(busy)]}
                              onPress={actions.retryAuto}
                            />
                          )}
                          <Button
                            label="Reset all"
                            role="destructive"
                            modifiers={[disabled(busy)]}
                            onPress={() => setResetting(true)}
                          />
                        </Menu>
                      </Dialog.Trigger>
                    </Dialog>
                  </HStack>
                }
              >
                <List.ForEach
                  data={excluded}
                  keyExtractor={(row) => row.source.id}
                  // Recycled rows are keyed by slot, so a swipe or menu action could land on another source.
                  recycling={false}
                >
                  {({ item: row }) => (
                    <SwipeActions>
                      <ContextMenu>
                        <ContextMenu.Items>
                          <Button
                            label="Include"
                            systemImage="arrow.uturn.backward"
                            modifiers={[disabled(busy)]}
                            onPress={() => actions.include(row.source.id)}
                          />
                        </ContextMenu.Items>
                        <ContextMenu.Trigger>
                          <HStack modifiers={FILL}>
                            <Label icon={tile(row.source)}>
                              <VStack alignment="leading" spacing={2}>
                                <Text
                                  weight="medium"
                                  modifiers={[lineLimit(1)]}
                                >
                                  {row.source.name}
                                </Text>
                                <Badge color={REASONS[row.reason].color}>
                                  {excludedBadge(row.reason, row.pinned)}
                                </Badge>
                              </VStack>
                            </Label>
                            <Spacer />
                          </HStack>
                        </ContextMenu.Trigger>
                      </ContextMenu>
                      {/* Both edges: a left swipe works here as on Available rows. */}
                      {(["leading", "trailing"] as const).map((edge) => (
                        <SwipeActions.Actions key={edge} edge={edge}>
                          <Button
                            label="Include"
                            systemImage="arrow.uturn.backward"
                            modifiers={[tint(primary), disabled(busy)]}
                            onPress={() => actions.include(row.source.id)}
                          />
                        </SwipeActions.Actions>
                      ))}
                    </SwipeActions>
                  )}
                </List.ForEach>
              </Section>
            )}
          </List>
        )}
      </VStack>
    </BottomSheet>
  );
}
