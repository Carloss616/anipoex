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
import { Dialog } from "@/components/ui/dialog";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import { SearchBar } from "@/components/ui/search-bar";
import { SheetToastHost } from "@/components/ui/toast";
import { manualTitles } from "@/features/manga/state/manual-matches";
import {
  isScanBusy,
  probes$,
  scanningAll$,
  scanProgress$,
} from "@/features/manga/state/probes";
import {
  areTitleSearching,
  titleSearch$,
} from "@/features/manga/state/title-search";
import { REASONS } from "@/features/manga/utils/msu";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  AvailableItem,
  type ErrorRequest,
  type ExcludeRequest,
} from "./components/available-item";
import { ExcludedItem } from "./components/excluded-item";
import { SectionHeader } from "./components/section-header";
import { useSourceActions } from "./hooks/use-source-actions";
import { useSourceList } from "./hooks/use-source-list";
import { useSources } from "./hooks/use-sources";
import { useTitleMode } from "./hooks/use-title-mode";
import type { ListBodyProps } from "./source-list";
import {
  errorDialog,
  excludedMenuItems,
  excludeReasons,
} from "./utils/row-content";
import { titleSearchItems } from "./utils/search-presets";
import { titleMenuItems } from "./utils/title-menu";

/** A glass circle's icon slot, as on the tracking overview's menu button. */
// A plain button only takes taps on its label: it fills its slot in the group.
const GROUP_SLOT = [
  frame({ width: 40, height: 40 }),
  contentShape(shapes.rectangle()),
];
// The same, sized to the search field's clear button.
const GROUP_SLOT_SM = [
  frame({ width: 28, height: 28 }),
  contentShape(shapes.rectangle()),
];

export function SourceList() {
  const { manga, read, selectedId, pick, close } = useSourceList();

  if (!manga) return null;
  return (
    <ListBody
      manga={manga}
      read={read}
      selectedId={selectedId}
      onSelect={(id) => {
        close();
        pick(id);
      }}
    />
  );
}

function ListBody({ manga, read, selectedId, onSelect }: ListBodyProps) {
  const { key, all, query, setQuery, available, excluded, empty, openedAt } =
    useSources({ mangaId: manga.id });
  const actions = useSourceActions({ manga, read, selectedId });
  const excludedMenu = () =>
    excludedMenuItems(
      excluded,
      isScanBusy(key),
      areTitleSearching(
        key,
        excluded.map((row) => row.source.id),
      ),
      actions,
    );
  const title = useTitleMode(manga.id, key);
  // One dialog for both row requests: a view presents one alert.
  const [request, setRequest] = useState<ExcludeRequest | ErrorRequest | null>(
    null,
  );
  const failed = request && "error" in request ? request : null;
  const excluding = request && "suspicious" in request ? request : null;
  const failure =
    failed && errorDialog(failed.source.name, failed.error, failed.excluded);
  const [surfaceSecondary, primary] = useThemeColor([
    "surface-secondary",
    "primary",
  ]);
  // Rows as in the extension list: inset-grouped cards, default row insets.
  const rowBackground = listRowBackground(surfaceSecondary);

  return (
    <>
      <Host className="flex-1">
        <VStack
          alignment="leading"
          spacing={16}
          // 10: the grabber's room, as `BottomSheet` leaves it.
          modifiers={[padding({ top: 10 + GUTTER, bottom: GUTTER })]}
        >
          <VStack
            alignment="leading"
            spacing={16}
            modifiers={[padding({ horizontal: GUTTER })]}
          >
            {/* The reason and error dialogs hang off the header: `.alert`
              needs a view that outlives the swiped row. */}
            <Dialog
              alert
              title={
                failure?.title ?? `Exclude ${excluding?.source.name ?? ""}`
              }
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
                      <Badge>{available.length + excluded.length}</Badge>
                    </HStack>
                    <Computed>
                      {() => {
                        const progress = scanProgress$[key].get();

                        return progress ? (
                          <Text
                            textStyle="subheadline"
                            modifiers={[foregroundStyle("secondary")]}
                          >
                            {`Scanning ${progress.done} of ${progress.total}`}
                          </Text>
                        ) : (
                          <HStack spacing={6}>
                            <Text
                              textStyle="subheadline"
                              modifiers={[foregroundStyle("secondary")]}
                            >
                              {read > 0 ? "Read" : "Not started"}
                            </Text>
                            {read > 0 && <Badge>c.{read}</Badge>}
                          </HStack>
                        );
                      }}
                    </Computed>
                  </VStack>
                  <Spacer />
                  {/* One glass capsule for both, as a native toolbar groups
                  its items. */}
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
                    <Computed>
                      {() => (
                        <Menu
                          items={titleSearchItems(
                            available,
                            excluded,
                            (id) => probes$[key][id].get(),
                            (id) =>
                              titleSearch$[key][id].status.get() !== undefined,
                            actions.searchSources,
                            () => actions.stopSearch(),
                          )}
                        >
                          {/* The menu's label is SwiftUI content: the icon,
                          tinted while title search is on, as a native
                          toolbar shows an active item. */}
                          <Icon
                            name={Icons.searchTitles}
                            color="inherit"
                            modifiers={[
                              ...GROUP_SLOT,
                              foregroundStyle(
                                title.searching ? primary : "secondary",
                              ),
                              accessibilityLabel("Search titles"),
                            ]}
                          />
                        </Menu>
                      )}
                    </Computed>
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
                            // The icon's slot, so the group never resizes;
                            // the button already reads its label.
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

            <Computed>
              {() => {
                const progress = scanProgress$[key].get();

                return progress ? (
                  <Progress value={progress.done} maxValue={progress.total} />
                ) : null;
              }}
            </Computed>

            {title.searching ? (
              <SearchBar
                key={title.fieldKey}
                defaultValue={title.query}
                onChangeText={title.type}
                onSubmit={title.submit}
                placeholder="Title to search"
                accessory={
                  // The check follows the field: an edit unchecks the title.
                  <Computed>
                    {() => (
                      <Menu
                        items={titleMenuItems(
                          manga,
                          title.fieldText(),
                          title.pick,
                          manualTitles(manga.id),
                        )}
                      >
                        <Icon
                          name={Icons.swap}
                          size={17}
                          color="inherit"
                          modifiers={[
                            ...GROUP_SLOT_SM,
                            foregroundStyle(primary),
                            accessibilityLabel("AniList titles"),
                          ]}
                        />
                      </Menu>
                    )}
                  </Computed>
                }
              />
            ) : (
              <SearchBar
                defaultValue={query}
                debounce={150}
                onDebouncedChange={setQuery}
                placeholder="Search sources"
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
                header={
                  <SectionHeader title="Available" count={available.length} />
                }
              >
                {available.length === 0 ? (
                  <Text modifiers={[foregroundStyle("secondary")]}>
                    No sources
                  </Text>
                ) : (
                  <List.ForEach
                    data={available}
                    keyExtractor={(row) => row.source.id}
                    // Recycled rows are keyed by slot: a swipe or menu action
                    // could land on another source.
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
                    <SectionHeader
                      title="Excluded"
                      count={excluded.length}
                      menu={excludedMenu}
                    />
                  }
                >
                  <List.ForEach
                    data={excluded}
                    keyExtractor={(row) => row.source.id}
                    // Recycled rows are keyed by slot: a swipe or menu action
                    // could land on another source.
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
      </Host>
      <SheetToastHost />
    </>
  );
}
