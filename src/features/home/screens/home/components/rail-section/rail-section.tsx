import { useFragment } from "@apollo/client/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { LegendList } from "@/components/layout/legend-list";
import { GridItem } from "@/features/manga/components/manga-grid/grid-item";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { SearchParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { SectionActions } from "../section-actions";

export interface RailSectionProps {
  title: string;
  media: MangaEntry[];
  /** "Show all" opens /search with these; none, no "Show all". */
  params?: SearchParams;
}

export function RailSection({ title, media, params }: RailSectionProps) {
  const { isAtLeast } = useBreakpoint();
  const { ref, scroll, edges$ } = useRailScroll();
  // From the cache, as the cards read it: the query's `media` keeps its first
  // list entries. A bar shows for a listed manga of known length.
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: media.map((m) => ({ __typename: "Media" as const, id: m.id })),
  });
  const hasBar = data.some((m) => m?.mediaListEntry && m.chapters);

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <SectionActions
          title={title}
          params={params}
          onScroll={isAtLeast("sm") ? scroll : undefined}
          edges$={edges$}
        />
      </Frame.Header>
      <Frame.Panel className="[--card-w:7rem] sm:[--card-w:7.75rem] lg:[--card-w:8.5rem]">
        <LegendList
          ref={ref}
          horizontal
          data={media}
          keyExtractor={(item) => String(item.id)}
          // The sm card; cells are measured anyway.
          estimatedItemSize={124}
          recycleItems
          columnWrapperStyle={{ gap: 12 }}
          // The last card keeps the gap after it: 4 + 12 ends like the start.
          contentContainerClassName="py-4 ps-4 pe-1"
          // 2:3 cover + title lines (48) + bar (14) + py-4 (32).
          className={cn(
            "min-w-0",
            hasBar
              ? "min-h-[calc(var(--card-w)*1.5+94px)]"
              : "min-h-[calc(var(--card-w)*1.5+80px)]",
          )}
          renderItem={({ item }) => (
            <View className="w-(--card-w)">
              <GridItem item={item} />
            </View>
          )}
        />
      </Frame.Panel>
    </Frame>
  );
}
