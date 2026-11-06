import { Frame } from "panelui-web/frame";
import { ScrollView } from "react-native";
import { GridItem } from "@/features/manga/components/manga-grid/grid-item";
import type { SearchParams } from "@/features/manga/utils/search-params";
import type { MangaEntry } from "@/features/manga/utils/to-entries";
import { useRailScroll } from "../../hooks/use-rail-scroll";
import { useSizeClass } from "../../hooks/use-size-class";
import { SectionActions } from "../section-actions";

export interface RailSectionProps {
  title: string;
  media: MangaEntry[];
  /** "Show all" opens /search with these; none, no "Show all". */
  params?: SearchParams;
}

const CARD_WIDTH = { compact: 112, medium: 124, expanded: 136 };

export function RailSection({ title, media, params }: RailSectionProps) {
  const size = useSizeClass();
  const { ref, scroll } = useRailScroll();

  return (
    <Frame>
      <Frame.Header>
        <Frame.Title>{title}</Frame.Title>
        <SectionActions
          title={title}
          params={params}
          onScroll={size === "compact" ? undefined : scroll}
        />
      </Frame.Header>
      <Frame.Panel>
        <ScrollView
          ref={ref}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 p-4"
        >
          {media.map((item) => (
            <GridItem key={item.id} item={item} width={CARD_WIDTH[size]} />
          ))}
        </ScrollView>
      </Frame.Panel>
    </Frame>
  );
}
