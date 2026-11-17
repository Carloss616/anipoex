import type { Observable } from "@legendapp/state";
import { useObservable, useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Sheet } from "panelui-web/sheet";
import { memo, useEffect, useState } from "react";
import { View } from "react-native";
import { EmptyState } from "@/components/blocks/empty-state";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import {
  BottomSheet,
  SHEET_CLOSE_MS,
  SHEET_INSET,
} from "@/components/ui/bottom-sheet";
import { Icon, Icons } from "@/components/ui/icon";
import { InfoPopover } from "@/components/ui/info-popover";
import { Loader } from "@/components/ui/loader";
import { Menu } from "@/components/ui/menu";
import { mangaCount } from "@/features/manga/constants";
import {
  deleting$,
  useManageCustomLists,
} from "@/features/manga/hooks/use-manage-custom-lists";
import type { CustomList } from "@/features/manga/utils/to-counts";
import { ListNameField } from "./components/list-name-field";
import { CUSTOM_LISTS_HELP, listMenuItems } from "./utils";

/** The account's custom lists: create one, delete one. */
export function CustomLists() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(true);
  }, []);

  return (
    <BottomSheet
      isPresented={open}
      onDismiss={() => {
        setOpen(false);
        // shortcut: the sheet has no close-end event; leave once it's down.
        setTimeout(() => router.back(), SHEET_CLOSE_MS);
      }}
    >
      <CustomListsBody />
    </BottomSheet>
  );
}

function CustomListsBody() {
  const { lists, create, rename, remove } = useManageCustomLists();
  const names = lists?.map((list) => list.name) ?? [];
  const renaming$ = useObservable<string | null>(null);

  return (
    <>
      <Sheet.Header className={SHEET_INSET.header}>
        <View className="flex-row items-center justify-between gap-1">
          <Sheet.Title>
            Custom lists <Badge>{names.length}</Badge>
          </Sheet.Title>
          <InfoPopover {...CUSTOM_LISTS_HELP} />
        </View>
      </Sheet.Header>
      <View className="gap-2 px-4 pt-4">
        <ListNameField
          names={names}
          renaming$={renaming$}
          onCreate={create}
          onRename={rename}
        />
      </View>
      <LegendList
        recycleItems
        data={lists ?? []}
        keyExtractor={(list) => list.key}
        keyboardShouldPersistTaps="handled"
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        ListEmptyComponent={
          <EmptyState
            title="No custom lists yet"
            description="Name one above, then add manga to it from their tracking sheet."
          />
        }
        renderItem={({ item }) => (
          <ListRow list={item} renaming$={renaming$} onDelete={remove} />
        )}
      />
    </>
  );
}

const ListRow = memo(function ListRow({
  list,
  renaming$,
  onDelete,
}: {
  list: CustomList;
  renaming$: Observable<string | null>;
  onDelete: (name: string) => Promise<boolean>;
}) {
  const editing = useValue(() => renaming$.get() === list.name);
  const removing = useValue(() => deleting$.get() === list.name);
  const busy = useValue(() => deleting$.get() != null);

  return (
    <Frame.Row className="px-0">
      <Frame.Content>
        <Frame.Title as="p">{list.name}</Frame.Title>
        <Frame.Description>{mangaCount(list.count)}</Frame.Description>
      </Frame.Content>
      <Frame.Actions>
        <Menu
          items={listMenuItems(
            list,
            {
              onRename: () => renaming$.set(list.name),
              onDelete: () => void onDelete(list.name),
            },
            busy,
          )}
          align="end"
        >
          <Button
            size="icon"
            variant="ghost"
            disabled={editing || removing}
            aria-label={
              removing
                ? `Deleting ${list.name}`
                : editing
                  ? `Renaming ${list.name}`
                  : `More actions for ${list.name}`
            }
          >
            {removing ? (
              <Loader size="sm" />
            ) : editing ? (
              <Icon name={Icons.edit} className="text-primary" />
            ) : (
              <Icon name={Icons.more} />
            )}
          </Button>
        </Menu>
      </Frame.Actions>
    </Frame.Row>
  );
});
