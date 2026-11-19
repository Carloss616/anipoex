import { Image } from "expo-image";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { View } from "react-native";
import { ActiveFilters } from "@/components/blocks/active-filters";
import { COVER_ROUNDED } from "@/features/manga/components/manga-card";
import { filterBy, openManga } from "../../utils/row-menu";
import { useFilterCard } from "./hooks/use-filter-card";

export interface FilterCardProps {
  mediaId: number;
}

/** The manga the list is narrowed to, and the chip that drops it. */
export function FilterCard({ mediaId }: FilterCardProps) {
  const { title, cover, detail } = useFilterCard(mediaId);

  return (
    <View className="gutters mx-gx mb-4 gap-3">
      <View className="flex-row flex-wrap items-center gap-3">
        <ActiveFilters
          filters={[{ label: title, clear: () => filterBy(undefined) }]}
        />
      </View>
      <Frame>
        <Frame.Panel>
          <Frame.Row>
            <Frame.Media>
              <Image
                source={cover?.medium}
                contentFit="cover"
                className={cn("aspect-2/3 w-12", COVER_ROUNDED)}
                style={{ backgroundColor: cover?.color ?? undefined }}
              />
            </Frame.Media>
            <Frame.Content>
              <Frame.Title as="p">{title}</Frame.Title>
              <Frame.Description>{detail}</Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => openManga(mediaId)}
              >
                Open manga
              </Button>
            </Frame.Actions>
          </Frame.Row>
        </Frame.Panel>
      </Frame>
    </View>
  );
}
