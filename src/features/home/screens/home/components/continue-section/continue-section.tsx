import { useFragment } from "@apollo/client/react";
import { Image } from "expo-image";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { RangeMeter } from "panelui-web/range-meter";
import { Stat } from "panelui-web/stat";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { ContextMenu } from "@/components/ui/menu";
import { PRESS } from "@/components/ui/press";
import type { ContinueItem } from "@/features/home/utils/continue-items";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import { useContinueActions } from "./hooks/use-continue-actions";

export interface ContinueSectionProps {
  title: string;
  items: ContinueItem[];
}

/** A card per manga, two to a row once there is room. */
export function ContinueSection({ title, items }: ContinueSectionProps) {
  const wide = useBreakpoint().isAtLeast("sm");

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <Frame.Action>{items.length} reading</Frame.Action>
      </Frame.Header>
      <Frame.Panel>
        <View className="flex-row flex-wrap p-1.5">
          {items.map((item) => (
            <View
              key={item.mangaId}
              className={cn("p-1.5", wide ? "w-1/2" : "w-full")}
            >
              <ContinueCard
                mangaId={item.mangaId}
                unread={item.unread}
                chapterId={item.next.id}
                chapterNumber={item.next.number}
              />
            </View>
          ))}
        </View>
      </Frame.Panel>
    </Frame>
  );
}

/**
 * Title, cover and progress from the cache, so a save in the reader shows:
 * how far as a figure with the new chapters beside it, where as a meter.
 */
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
  const total = read + unread;
  const title = data.title?.userPreferred ?? "";

  return (
    <ContextMenu items={menu}>
      <Pressable
        role="button"
        aria-label={`${title}: read chapter ${chapterNumber}, ${unread} new`}
        onPress={open}
        className={cn(
          PRESS,
          // A <button> centers its text by default.
          "bg-muted/40 hover:bg-muted/70 gap-3 rounded-xl p-3 text-start transition-colors",
        )}
      >
        <View className="flex-row gap-3">
          <View>
            <Image
              source={data.coverImage?.medium}
              contentFit="cover"
              style={{
                width: 48,
                height: 70,
                borderRadius: 8,
                backgroundColor: data.coverImage?.color ?? undefined,
              }}
            />
            <View className="absolute inset-0 items-center justify-center">
              <View className="size-6 items-center justify-center rounded-full bg-black/55">
                <Icon name={Icons.play} size={12} className="text-white" />
              </View>
            </View>
          </View>
          <Stat className="min-w-0 flex-1">
            <Stat.Content className="min-w-0">
              <Stat.Label weight="medium" className="text-foreground truncate">
                {title}
              </Stat.Label>
              <Stat.Value size="sm">
                {/* Floor: 294 of 295 is not done. */}
                {Math.floor((read / total) * 100)}
                <Stat.Unit>%</Stat.Unit>
              </Stat.Value>
            </Stat.Content>
            <Badge color="primary">+{unread}</Badge>
          </Stat>
        </View>
        <RangeMeter
          min={0}
          max={total}
          value={read}
          ticks={36}
          color="primary"
          formatValue={(value) => `c.${value}`}
          label={`${title}: chapters read`}
          valueText={`${read} of ${total} chapters`}
        />
      </Pressable>
    </ContextMenu>
  );
});
