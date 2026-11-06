import { Column, LazyRow } from "@expo/ui/jetpack-compose";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import { GridItem } from "@/features/manga/components/manga-grid/grid-item";
import { toRouteParams } from "@/features/manga/utils/search-params";
import { useRailTitle } from "./hooks/use-rail-title";
import type { RailSectionProps } from "./rail-section";

const CARD_WIDTH = 112;

/** An uncontained row of covers, titles below. */
export function RailSection({ title, media, params }: RailSectionProps) {
  const router = useRouter();
  const titlePosition = useRailTitle();

  return (
    <Column>
      <SectionHeader
        title={title}
        onShowAll={
          params &&
          (() =>
            router.push({ pathname: "/search", params: toRouteParams(params) }))
        }
      />
      <LazyRow
        horizontalArrangement={{ spacedBy: 8 }}
        contentPadding={{ start: GUTTER, end: GUTTER }}
      >
        <LazyRow.Items
          data={media}
          keyExtractor={(item) => String(item.id)}
          estimatedItemSize={CARD_WIDTH}
        >
          {({ item }) => (
            <GridItem
              item={item}
              width={CARD_WIDTH}
              titlePosition={titlePosition}
            />
          )}
        </LazyRow.Items>
      </LazyRow>
    </Column>
  );
}
