import {
  Button,
  HStack,
  List,
  Section,
  Spacer,
  SwipeActions,
  VStack,
} from "@expo/ui/swift-ui";
import {
  disabled,
  foregroundStyle,
  lineLimit,
  listRowBackground,
  listStyle,
  onTapGesture,
  padding,
  scrollContentBackground,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import type { Observable } from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { memo, useState } from "react";
import { EmptyState } from "@/components/blocks/empty-state";
import { GUTTER } from "@/components/native/constants";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Host } from "@/components/ui/host";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import { InfoPopover } from "@/components/ui/info-popover";
import { Loader } from "@/components/ui/loader";
import { ContextMenu } from "@/components/ui/menu";
import { SheetToastHost } from "@/components/ui/toast";
import { mangaCount } from "@/features/manga/constants";
import {
  deleting$,
  useManageCustomLists,
} from "@/features/manga/hooks/use-manage-custom-lists";
import type { CustomList } from "@/features/manga/utils/to-counts";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ListNameField } from "./components/list-name-field";
import { CUSTOM_LISTS_HELP, deleteListDialog, listMenuItems } from "./utils";

export function CustomLists() {
  const { lists, create, rename, remove } = useManageCustomLists();
  const renaming$ = useObservable<string | null>(null);
  const [surfaceSecondary, primary, destructive] = useThemeColor([
    "surface-secondary",
    "primary",
    "destructive",
  ]);
  const font = useFont();
  const names = lists?.map((list) => list.name) ?? [];

  return (
    <>
      <Host className="flex-1">
        <VStack alignment="leading" spacing={16}>
          <VStack
            alignment="leading"
            spacing={16}
            // 10: the grabber's room, as `BottomSheet` leaves it.
            modifiers={[padding({ top: 10 + GUTTER, horizontal: GUTTER })]}
          >
            <HStack spacing={8}>
              <Text textStyle="title3">Custom lists</Text>
              <Badge>{names.length}</Badge>
              <Spacer />
              <InfoPopover {...CUSTOM_LISTS_HELP} />
            </HStack>
            <ListNameField
              names={names}
              renaming$={renaming$}
              onCreate={create}
              onRename={rename}
            />
          </VStack>
          <List
            modifiers={[
              listStyle("insetGrouped"),
              scrollContentBackground("hidden"),
              font,
            ]}
          >
            {names.length > 0 ? (
              <Section
                modifiers={[listRowBackground(surfaceSecondary)]}
                title="Your lists"
              >
                <List.ForEach
                  data={lists ?? []}
                  keyExtractor={(list) => list.key}
                  recycling={false}
                >
                  {({ item }) => (
                    <ListRow
                      list={item}
                      renaming$={renaming$}
                      onDelete={remove}
                      primary={primary}
                      destructive={destructive}
                    />
                  )}
                </List.ForEach>
              </Section>
            ) : (
              <Section modifiers={[listRowBackground("transparent")]}>
                <EmptyState
                  title="No custom lists yet"
                  description="Name one above, then add manga to it from their tracking sheet."
                />
              </Section>
            )}
          </List>
        </VStack>
      </Host>
      <SheetToastHost />
    </>
  );
}

/** A tap renames; the menu and the swipes rename and delete, off while it is renamed. */
const ListRow = memo(function ListRow({
  list,
  renaming$,
  onDelete,
  primary,
  destructive,
}: {
  list: CustomList;
  renaming$: Observable<string | null>;
  onDelete: (name: string) => Promise<boolean>;
  primary: string;
  destructive: string;
}) {
  const [deleting, setDeleting] = useState(false);
  const editing = useValue(() => renaming$.get() === list.name);
  const removing = useValue(() => deleting$.get() === list.name);
  const busy = useValue(() => deleting$.get() != null) || editing;
  const onRename = () => renaming$.set(list.name);
  const menu = listMenuItems(
    list,
    { onRename, onDelete: () => setDeleting(true) },
    busy,
    false,
  );

  return (
    <SwipeActions>
      <ContextMenu items={menu}>
        <HStack spacing={8} modifiers={[...ROW_FILL, onTapGesture(onRename)]}>
          <VStack alignment="leading" spacing={2}>
            <Text weight="medium" modifiers={[lineLimit(1)]}>
              {list.name}
            </Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {mangaCount(list.count)}
            </Text>
            {/* Without a trigger it draws an empty spacer: kept in the row. */}
            <Dialog
              {...deleteListDialog(list)}
              alert
              role="destructive"
              open={deleting}
              onOpenChange={setDeleting}
              onConfirm={() => void onDelete(list.name)}
            />
          </VStack>
          {(editing || removing) && (
            <>
              <Spacer />
              {removing ? (
                <Loader size="sm" />
              ) : (
                <Icon name={Icons.edit} color={primary} />
              )}
            </>
          )}
        </HStack>
      </ContextMenu>
      {!editing && (
        <>
          <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
            <Button
              label="Delete"
              systemImage={sfSymbol(Icons.trash)}
              // No destructive role: SwiftUI would drop the row before confirming.
              modifiers={[tint(destructive), disabled(busy)]}
              onPress={() => setDeleting(true)}
            />
          </SwipeActions.Actions>
          <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
            <Button
              label="Rename"
              systemImage={sfSymbol(Icons.edit)}
              modifiers={[tint(primary), disabled(busy)]}
              onPress={onRename}
            />
          </SwipeActions.Actions>
        </>
      )}
    </SwipeActions>
  );
});
