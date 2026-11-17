import { Image } from "expo-image";
import { router } from "expo-router";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo, useState } from "react";
import { View } from "react-native";
import { Dialog } from "@/components/ui/dialog";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { discardPending } from "../../../activity/utils/actions";
import { DISCARD_DIALOG, discardItem } from "../../../activity/utils/row-menu";
import { useEntryItem } from "./hooks/use-entry-item";

export interface EntryItemProps {
  /** The AniList media id the change is kept under. */
  id: string;
}

/** A change to an AniList entry that waits for a connection. */
export const EntryItem = memo(function EntryItem({ id }: EntryItemProps) {
  const { title, cover, summary } = useEntryItem(id);
  const [discarding, setDiscarding] = useState(false);

  return (
    <View>
      <ContextMenu items={[discardItem(id)]}>
        <Frame.Row
          onClick={() => router.navigate(`/manga/${id}`)}
          className="pe-17"
        >
          <Frame.Media>
            <Image
              source={cover}
              contentFit="cover"
              className="aspect-2/3 w-7 rounded-sm"
            />
          </Frame.Media>
          <Frame.Content>
            <Frame.Title as="p">{title}</Frame.Title>
            <Frame.Description>{summary}</Frame.Description>
          </Frame.Content>
        </Frame.Row>
      </ContextMenu>
      <Frame.Actions className="absolute inset-y-0 inset-e-4">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setDiscarding(true)}
          aria-label={`Discard ${title}`}
        >
          <Icon name={Icons.trash} />
        </Button>
      </Frame.Actions>
      <Dialog
        {...DISCARD_DIALOG}
        role="destructive"
        open={discarding}
        onOpenChange={setDiscarding}
        onConfirm={() => discardPending(Number(id))}
      />
    </View>
  );
});
