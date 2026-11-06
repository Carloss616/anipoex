import { useFragment } from "@apollo/client/react";
import { Image } from "expo-image";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useContinueActions } from "./hooks/use-continue-actions";

export interface ContinueSectionProps {
  title: string;
  items: ContinueItem[];
}

export function ContinueSection({ title, items }: ContinueSectionProps) {
  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <Frame.Action>{items.length} reading</Frame.Action>
      </Frame.Header>
      <Frame.Panel>
        {items.map((item) => (
          <ContinueRow
            key={item.mangaId}
            mangaId={item.mangaId}
            unread={item.unread}
            chapterId={item.next.id}
            chapterNumber={item.next.number}
          />
        ))}
      </Frame.Panel>
    </Frame>
  );
}

/** Title, cover and progress from the cache, so a save in the reader shows. */
const ContinueRow = memo(function ContinueRow({
  mangaId,
  unread,
  chapterId,
  chapterNumber,
}: {
  mangaId: number;
  unread: number;
  chapterId: string;
  chapterNumber: number;
}) {
  const { read: open, menu } = useContinueActions(
    mangaId,
    chapterId,
    chapterNumber,
  );
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: { __typename: "Media", id: mangaId },
  });
  const read = data.mediaListEntry?.progress ?? 0;
  const title = data.title?.userPreferred ?? "";

  return (
    // Right-click: continue, or the manga's page.
    <ContextMenu items={menu}>
      <Frame.Row
        aria-label={`${title}: read chapter ${chapterNumber}, ${unread} new`}
        onClick={open}
      >
        <Frame.Media className="relative">
          <Image
            source={data.coverImage?.medium}
            contentFit="cover"
            style={{
              width: 40,
              height: 58,
              borderRadius: 8,
              backgroundColor: data.coverImage?.color ?? undefined,
            }}
          />
          <View className="absolute inset-0 items-center justify-center">
            <View className="size-6 items-center justify-center rounded-full bg-black/55">
              <Icon name={Icons.play} size={12} className="text-white" />
            </View>
          </View>
        </Frame.Media>
        <Frame.Content>
          <Frame.Title as="p">{title}</Frame.Title>
          <Frame.Description>
            c.{read} <Badge color="primary">+{unread}</Badge>
          </Frame.Description>
          <Progress
            value={read}
            maxValue={read + unread}
            size="sm"
            className="mt-1.5"
          />
        </Frame.Content>
        <Frame.Actions className="text-muted-foreground text-sm">
          Read c.{chapterNumber}
        </Frame.Actions>
      </Frame.Row>
    </ContextMenu>
  );
});
