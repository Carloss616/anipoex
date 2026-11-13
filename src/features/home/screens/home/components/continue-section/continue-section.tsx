import { useFragment } from "@apollo/client/react";
import { Image } from "expo-image";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { memo } from "react";
import { View } from "react-native";
import { LegendList } from "@/components/layout/legend-list";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { Progress } from "@/components/ui/progress";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { SectionActions } from "../section-actions";
import { useContinueActions } from "./hooks/use-continue-actions";

// Fixed, so every card in the row lines up: two title lines fit.
const CARD = { width: 280, height: 98 };

export interface ContinueSectionProps {
  title: string;
  items: ContinueItem[];
}

export function ContinueSection({ title, items }: ContinueSectionProps) {
  const { isAtLeast } = useBreakpoint();
  const { ref, scroll, edges$ } = useRailScroll();

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <SectionActions
          title={title}
          onScroll={isAtLeast("sm") ? scroll : undefined}
          edges$={edges$}
        />
      </Frame.Header>
      <Frame.Panel>
        <LegendList
          ref={ref}
          horizontal
          data={items}
          keyExtractor={(item) => String(item.mangaId)}
          estimatedItemSize={CARD.width}
          recycleItems
          columnWrapperStyle={{ gap: 12 }}
          // The last card keeps the gap after it: 4 + 12 ends like the start.
          contentContainerClassName="py-4 ps-4 pe-1"
          style={{ minWidth: 0, minHeight: CARD.height + 32 }}
          renderItem={({ item }) => (
            <View style={CARD}>
              <ContinueCard
                mangaId={item.mangaId}
                unread={item.unread}
                chapterId={item.next.id}
                chapterNumber={item.next.number}
              />
            </View>
          )}
        />
      </Frame.Panel>
    </Frame>
  );
}

/** Title, cover and progress from the cache, so a save in the reader shows. */
const ContinueCard = memo(function ContinueCard({
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
    <ContextMenu items={menu}>
      <Button
        aria-label={`${title}: read chapter ${chapterNumber}, ${unread} new`}
        onClick={open}
        variant="secondary"
        className="h-auto gap-2.5 p-2.5"
      >
        <View>
          <Image
            source={data.coverImage?.medium}
            contentFit="cover"
            className="aspect-2/3 w-13 rounded-sm"
            style={{
              backgroundColor: data.coverImage?.color ?? undefined,
            }}
          />
          <View className="absolute inset-0 items-center justify-center">
            <View className="size-6 items-center justify-center rounded-full bg-black/55">
              <Icon name={Icons.play} size={12} className="text-white" />
            </View>
          </View>
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Typography type="small" weight="semibold" numberOfLines={1}>
            {title}
          </Typography>
          <View className="flex-row items-center gap-1.5">
            <Typography type="body-xs" muted>
              Read
            </Typography>
            <Badge>c.{read}</Badge>
            {unread > 0 && <Badge color="primary">+{unread}</Badge>}
          </View>
          <Progress value={read} maxValue={read + unread} size="sm" />
        </View>
      </Button>
    </ContextMenu>
  );
});
