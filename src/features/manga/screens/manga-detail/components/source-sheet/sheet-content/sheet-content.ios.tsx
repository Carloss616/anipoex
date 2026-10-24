import {
  Button,
  HStack,
  List,
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
  glassEffect,
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
import { Menu } from "@/components/ui/menu";
import { SearchBar } from "@/components/ui/search-bar";
import { isScanBusy, scanningAll$ } from "@/features/manga/state/probes";
import { REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  AvailableItem,
  type ErrorRequest,
  type ExcludeRequest,
} from "../available-item";
import { ExcludedItem } from "../excluded-item";
import { useSourceActions } from "../hooks/use-source-actions";
import { useSources } from "../hooks/use-sources";
import { useTitleMode } from "../hooks/use-title-mode";
import {
  errorDialog,
  excludedMenuItems,
  excludeReasons,
} from "../utils/row-content";
import type { SheetContentProps } from "./sheet-content";

/** A glass circle's icon slot, as on the tracking overview's menu button. */
// A plain button only takes taps on its label: the label fills its slot in the group.
const GROUP_SLOT = [
  frame({ width: 40, height: 40 }),
  contentShape(shapes.rectangle()),
];

function SectionHeader({ children }: { children: string }) {
  return (
    <Text textStyle="footnote" weight="medium">
      {children}
    </Text>
  );
}

export function SheetContent({
  manga,
  read,
  isPresented,
  selectedId,
  onSelect,
  onDismiss,
}: SheetContentProps) {
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id, isPresented });
  const actions = useSourceActions({ manga, read, selectedId });
  const title = useTitleMode(manga.id, key);
  // One dialog for both row requests: a view presents one alert.
  const [request, setRequest] = useState<ExcludeRequest | ErrorRequest | null>(
    null,
  );
  const failed = request && "error" in request ? request : null;
  const excluding = request && "suspicious" in request ? request : null;
  const failure =
    failed && errorDialog(failed.source.name, failed.error, failed.excluded);
  const [muted, primary] = useThemeColor(["muted", "primary"]);
  // Rows as in the extension list: inset-grouped cards on the sheet, default row insets.
  const rowBackground = listRowBackground(muted);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      expanded={title.searching}
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
          {/* The reason and error dialogs hang off the header: `.alert` needs a view that outlives the swiped row. */}
          <Dialog
            alert
            title={failure?.title ?? `Exclude ${excluding?.source.name ?? ""}`}
            description={failure?.description}
            open={request !== null}
            onOpenChange={(open) => !open && setRequest(null)}
            actions={
              failed && failure
                ? [
                    {
                      label: failure.confirmLabel,
                      onPress: () =>
                        failed.excluded
                          ? actions.include(failed.source.id)
                          : actions.rescan(failed.source.id),
                    },
                  ]
                : excluding
                  ? excludeReasons(excluding.suspicious).map((reason) => ({
                      label: REASONS[reason].menu,
                      role: "destructive",
                      onPress: () =>
                        actions.exclude(excluding.source.id, reason),
                    }))
                  : []
            }
          >
            <Dialog.Trigger>
              <HStack>
                <VStack alignment="leading" spacing={2}>
                  <HStack spacing={8}>
                    <Text textStyle="title3">Sources</Text>
                    <Badge>{available.length}</Badge>
                  </HStack>
                  <HStack spacing={6}>
                    <Text
                      textStyle="subheadline"
                      modifiers={[foregroundStyle("secondary")]}
                    >
                      {read > 0 ? "Read" : "Not started"}
                    </Text>
                    {read > 0 && <Badge>c.{read}</Badge>}
                  </HStack>
                </VStack>
                <Spacer />
                {/* One glass capsule for both, as a native toolbar groups its items. */}
                <HStack
                  spacing={0}
                  modifiers={[
                    padding({ horizontal: 2 }),
                    glassEffect({
                      glass: { variant: "regular", interactive: true },
                      shape: "capsule",
                    }),
                  ]}
                >
                  <Button
                    onPress={() =>
                      // Excluded sources too: the right page may be on one dropped for no match.
                      actions.searchAll(
                        [...available, ...excluded].map((row) => row.source.id),
                      )
                    }
                    modifiers={[
                      buttonStyle("plain"),
                      // Tinted while title search is on, as a native toolbar shows an active item.
                      foregroundStyle(title.searching ? primary : "secondary"),
                      accessibilityLabel("Search titles in all sources"),
                    ]}
                  >
                    <Icon
                      name={
                        title.searching
                          ? Icons.searchTitlesOff
                          : Icons.searchTitles
                      }
                      size={BUTTON_ICON_SIZE}
                      color="inherit"
                      modifiers={GROUP_SLOT}
                    />
                  </Button>
                  <Computed>
                    {() => (
                      <Button
                        onPress={actions.scanAll}
                        modifiers={[
                          buttonStyle("plain"),
                          foregroundStyle("secondary"),
                          disabled(scanningAll$[key].get() === true),
                          accessibilityLabel("Scan all sources"),
                        ]}
                      >
                        {scanningAll$[key].get() ? (
                          // The icon's slot, so the group never resizes; the button already reads its label.
                          <HStack
                            modifiers={[
                              ...GROUP_SLOT,
                              accessibilityHidden(true),
                            ]}
                          >
                            <Loader size="sm" />
                          </HStack>
                        ) : (
                          <Icon
                            name={Icons.refresh}
                            size={BUTTON_ICON_SIZE}
                            color="inherit"
                            modifiers={GROUP_SLOT}
                          />
                        )}
                      </Button>
                    )}
                  </Computed>
                </HStack>
              </HStack>
            </Dialog.Trigger>
          </Dialog>
          {title.searching ? (
            <SearchBar
              key="titles"
              defaultValue={title.query}
              onSubmit={title.submit}
              placeholder="Title to search"
            />
          ) : (
            <SearchBar
              defaultValue={query}
              debounce={150}
              onDebouncedChange={setQuery}
              placeholder="Search sources..."
              cancel="focus"
            />
          )}
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
                      onExclude={setRequest}
                      onError={setRequest}
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
                    {/* A section header's action is text, as Update all on the extension list. */}
                    <Computed>
                      {() => (
                        <Menu
                          items={excludedMenuItems(
                            excluded,
                            isScanBusy(key),
                            actions,
                          )}
                        >
                          <Text textStyle="subheadline" weight="medium">
                            Manage
                          </Text>
                        </Menu>
                      )}
                    </Computed>
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
                      onError={setRequest}
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
