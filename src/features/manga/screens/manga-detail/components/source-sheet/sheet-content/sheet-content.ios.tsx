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
  buttonBorderShape,
  buttonStyle,
  defaultScrollAnchorForRole,
  disabled,
  foregroundStyle,
  frame,
  labelStyle,
  listRowBackground,
  listStyle,
  padding,
  scrollContentBackground,
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
import {
  errorDialog,
  excludedMenuItems,
  excludeReasons,
} from "../utils/row-content";
import type { SheetContentProps } from "./sheet-content";

/** A glass circle's icon slot, as on the tracking overview's menu button. */
const ICON_FRAME = frame({ width: 20, height: 20 });

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
  // One dialog for both row requests: a view presents one alert.
  const [request, setRequest] = useState<ExcludeRequest | ErrorRequest | null>(
    null,
  );
  const failed = request && "error" in request ? request : null;
  const excluding = request && "suspicious" in request ? request : null;
  const failure =
    failed && errorDialog(failed.source.name, failed.error, failed.excluded);
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
                        buttonStyle("glass"),
                        buttonBorderShape("circle"),
                        labelStyle("iconOnly"),
                        foregroundStyle("secondary"),
                        disabled(isScanBusy(key)),
                        accessibilityLabel("Scan all sources"),
                      ]}
                    >
                      {scanningAll$[key].get() ? (
                        // The icon's slot, so the button never resizes; the button already reads its label.
                        <HStack
                          modifiers={[ICON_FRAME, accessibilityHidden(true)]}
                        >
                          <Loader size="sm" />
                        </HStack>
                      ) : (
                        <Icon
                          name={Icons.refresh}
                          size={BUTTON_ICON_SIZE}
                          color="inherit"
                          modifiers={[ICON_FRAME]}
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
