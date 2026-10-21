import {
  Button,
  HStack,
  List,
  Menu,
  ScrollView,
  Section,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  accessibilityHidden,
  accessibilityLabel,
  buttonStyle,
  contentShape,
  defaultScrollAnchorForRole,
  disabled,
  foregroundStyle,
  frame,
  listRowBackground,
  listStyle,
  padding,
  scrollContentBackground,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
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
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import { AvailableItem, type ExcludeRequest } from "./available-item";
import { ExcludedItem } from "./excluded-item";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSources } from "./hooks/use-sources";
import type { SourceSheetProps } from "./source-sheet";
import { excludeReasons, RESET_DIALOG } from "./utils/row-content";

/** A 44pt hit area: a button or menu only takes touches on its label. */
const HIT = [
  frame({ width: 44, height: 44 }),
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
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id, isPresented });
  const actions = useSourceActions({ manga, read, selectedId });
  const [excluding, setExcluding] = useState<ExcludeRequest | null>(null);
  const [resetting, setResetting] = useState(false);
  const muted = useThemeColor("muted");
  // Rows as in the extension list: inset-grouped cards on the sheet, default row insets.
  const rowBackground = listRowBackground(muted);

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
                <Computed>
                  {() => (
                    <Button
                      onPress={actions.scanAll}
                      modifiers={[
                        buttonStyle("borderless"),
                        disabled(isScanBusy(key)),
                        accessibilityLabel("Scan all sources"),
                      ]}
                    >
                      {scanningAll$[key].get() ? (
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
                  )}
                </Computed>
              </HStack>
            </Dialog.Trigger>
          </Dialog>
          <SearchBar
            defaultValue={query}
            debounce={150}
            onDebouncedChange={setQuery}
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
                  {({ item: row }) => (
                    <AvailableItem
                      source={row.source}
                      mangaKey={key}
                      sources={all}
                      read={read}
                      openedAt={openedAt}
                      selected={row.source.id === selectedId}
                      actions={actions}
                      onSelect={onSelect}
                      onExclude={setExcluding}
                    />
                  )}
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
                          <Computed>
                            {() => (
                              <>
                                {excluded.some((row) => !row.pinned) && (
                                  <Button
                                    label="Retry auto-excluded"
                                    modifiers={[disabled(isScanBusy(key))]}
                                    onPress={actions.retryAuto}
                                  />
                                )}
                                <Button
                                  label="Reset all"
                                  role="destructive"
                                  modifiers={[disabled(isScanBusy(key))]}
                                  onPress={() => setResetting(true)}
                                />
                              </>
                            )}
                          </Computed>
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
                    <ExcludedItem
                      source={row.source}
                      reason={row.reason}
                      pinned={row.pinned}
                      mangaKey={key}
                      actions={actions}
                    />
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
