import { Box, Column, LazyColumn, Row, Spacer } from "@expo/ui/jetpack-compose";
import {
  align,
  background,
  clip,
  fillMaxSize,
  fillMaxWidth,
  padding,
  Shapes,
  size,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { Observable } from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { memo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { nestedScrollInteropConnection } from "@/components/native/jetpack-compose/nested-scroll-interop-connection";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Badge } from "@/components/ui/badge";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { InfoPopover } from "@/components/ui/info-popover";
import { Loader } from "@/components/ui/loader";
import { ContextMenu } from "@/components/ui/menu";
import { mangaCount } from "@/features/manga/constants";
import {
  deleting$,
  useManageCustomLists,
} from "@/features/manga/hooks/use-manage-custom-lists";
import { useSheetOver } from "@/features/manga/hooks/use-sheet-over";
import type { CustomList } from "@/features/manga/utils/to-counts";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { ListNameField } from "./components/list-name-field";
import { CUSTOM_LISTS_HELP, isOverMangaList, listMenuItems } from "./utils";

export function CustomLists() {
  useSheetOver(isOverMangaList, "/manga", "/manga/custom-lists");
  const { lists, create, rename, remove } = useManageCustomLists();
  const renaming$ = useObservable<string | null>(null);
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();
  const names = lists?.map((list) => list.name) ?? [];

  return (
    <>
      {/* Two Hosts, as in the source list: the sheet drags from the header. */}
      <Host matchContents={{ vertical: true }}>
        <Column>
          {/* M3's drag handle, as the other sheets draw it. */}
          <Box
            modifiers={[
              align("centerHorizontally"),
              padding(0, 22, 0, 22),
              size(32, 4),
              clip(Shapes.RoundedCorner(2)),
              background(m3.onSurfaceVariant),
            ]}
          />
          <Column modifiers={[padding(insets.left, 0, insets.right, 0)]}>
            <Row
              verticalAlignment="center"
              horizontalArrangement={{ spacedBy: 8 }}
              modifiers={[
                fillMaxWidth(),
                padding(GUTTER, GUTTER, GUTTER, GUTTER),
              ]}
            >
              <Text style={{ typography: "titleLarge" }}>Custom lists</Text>
              {/* M3's badge reads high against a centered title. */}
              <Box modifiers={[padding(0, 4, 0, 0)]}>
                <Badge>{names.length}</Badge>
              </Box>
              <Spacer modifiers={[weight(1)]} />
              <InfoPopover {...CUSTOM_LISTS_HELP} />
            </Row>
            <Box modifiers={[padding(GUTTER, 0, GUTTER, 8)]}>
              <ListNameField
                names={names}
                renaming$={renaming$}
                onCreate={create}
                onRename={rename}
              />
            </Box>
          </Column>
        </Column>
      </Host>
      <Host className="flex-1">
        <Column modifiers={[fillMaxSize(), nestedScrollInteropConnection()]}>
          <LazyColumn
            modifiers={[weight(1)]}
            contentPadding={{
              start: insets.left,
              end: insets.right,
              bottom: GUTTER,
            }}
          >
            <LazyColumn.Items
              data={lists ?? []}
              keyExtractor={(list) => list.key}
            >
              {({ item, index }) => (
                <ListRow
                  list={item}
                  index={index}
                  count={names.length}
                  renaming$={renaming$}
                  onDelete={remove}
                />
              )}
            </LazyColumn.Items>
            {names.length === 0 && (
              <EmptyState
                title="No custom lists yet"
                description="Name one above, then add manga to it from their tracking sheet."
              />
            )}
          </LazyColumn>
        </Column>
      </Host>
    </>
  );
}

const ListRow = memo(function ListRow({
  list,
  index,
  count,
  renaming$,
  onDelete,
}: {
  list: CustomList;
  index: number;
  count: number;
  renaming$: Observable<string | null>;
  onDelete: (name: string) => Promise<boolean>;
}) {
  const m3 = useThemeM3Colors();
  const editing = useValue(() => renaming$.get() === list.name);
  const removing = useValue(() => deleting$.get() === list.name);
  const busy = useValue(() => deleting$.get() != null) || editing;
  const menu = listMenuItems(
    list,
    {
      onRename: () => renaming$.set(list.name),
      onDelete: () => void onDelete(list.name),
    },
    busy,
  );
  return (
    <Box
      modifiers={[padding(GUTTER, index > 0 ? SEGMENTED_GAP : 0, GUTTER, 0)]}
    >
      {/* No tap of its own: a tap opens the menu as a long press does. */}
      <ContextMenu items={menu}>
        <SegmentedListItem
          index={index}
          count={count}
          colors={{
            containerColor: editing
              ? m3.secondaryContainer
              : m3.surfaceContainerHigh,
          }}
        >
          <Text style={{ fontWeight: "500" }} maxLines={1} overflow="ellipsis">
            {list.name}
          </Text>
          <SegmentedListItem.Supporting>
            <Text style={{ typography: "bodyMedium" }}>
              {mangaCount(list.count)}
            </Text>
          </SegmentedListItem.Supporting>
          {(editing || removing) && (
            <SegmentedListItem.Trailing>
              {removing ? (
                <Loader size="sm" />
              ) : (
                <Icon name={Icons.edit} color={m3.primary} />
              )}
            </SegmentedListItem.Trailing>
          )}
        </SegmentedListItem>
      </ContextMenu>
    </Box>
  );
});
