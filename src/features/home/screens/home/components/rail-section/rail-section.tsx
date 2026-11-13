import { useFragment } from "@apollo/client/react";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Frame } from "panelui-web/frame";
import { LegendList } from "@/components/layout/legend-list";
import { GridItem } from "@/features/manga/components/manga-grid/grid-item";
import { MangaMediaFragmentDoc } from "@/features/manga/graphql/manga-fragments.generated";
import type { SearchParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { SectionActions } from "../section-actions";

// Under the 2:3 cover: two title lines, and the progress bar when one shows.
const TEXT_HEIGHT = 48;
const BAR_HEIGHT = 14;

export interface RailSectionProps {
  title: string;
  media: MangaEntry[];
  /** "Show all" opens /search with these; none, no "Show all". */
  params?: SearchParams;
}

export function RailSection({ title, media, params }: RailSectionProps) {
  const { isAtLeast } = useBreakpoint();
  const cardWidth = isAtLeast("lg") ? 136 : isAtLeast("sm") ? 124 : 112;
  const { ref, scroll, edges$ } = useRailScroll();
  // From the cache, as the cards read it: the query's `media` keeps its first
  // list entries. A bar shows for a listed manga of known length.
  const { data } = useFragment({
    fragment: MangaMediaFragmentDoc,
    fragmentName: "MangaMedia",
    from: media.map((m) => ({ __typename: "Media" as const, id: m.id })),
  });
  const hasBar = data.some((m) => m?.mediaListEntry && m.chapters);
  const cardHeight = cardWidth * 1.5 + TEXT_HEIGHT + (hasBar ? BAR_HEIGHT : 0);

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
      <Frame.Panel>
        <LegendList
          ref={ref}
          horizontal
          data={media}
          keyExtractor={(item) => String(item.id)}
          estimatedItemSize={cardWidth}
          recycleItems
          columnWrapperStyle={{ gap: 12 }}
          // The last card keeps the gap after it: 4 + 12 ends like the start.
          contentContainerClassName="py-4 ps-4 pe-1"
          style={{ minWidth: 0, minHeight: cardHeight + 32 }}
          renderItem={({ item }) => <GridItem item={item} width={cardWidth} />}
        />
      </Frame.Panel>
    </Frame>
  );
}
