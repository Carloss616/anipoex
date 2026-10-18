import { HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import { padding } from "@expo/ui/swift-ui/modifiers";
import { GUTTER_TOP, GUTTER_X } from "@/components/native/gutters";
import { Chip } from "@/components/ui/chip";
import { MangaCard } from "@/features/manga/components/manga-card";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import type { DetailHeaderProps } from "./detail-header";

export function DetailHeader({ manga }: DetailHeaderProps) {
  const hasGenres = !!manga.genres?.length;

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ top: GUTTER_TOP })]}
    >
      <HStack
        alignment="bottom"
        spacing={16}
        modifiers={[padding({ horizontal: GUTTER_X })]}
      >
        <MangaCard
          cover={manga.coverImage?.large}
          coverThumb={manga.coverImage?.medium}
          coverColor={manga.coverImage?.color}
          accessibilityLabel={manga.title?.userPreferred ?? undefined}
          testID="manga-detail-cover"
          // A style, not a class: the card reads its width back for its height.
          style={{ width: 144 }}
        />
        <Meta manga={manga} />
      </HStack>

      {hasGenres && (
        <ScrollView axes="horizontal" showsIndicators={false}>
          <HStack
            spacing={8}
            modifiers={[padding({ horizontal: GUTTER_X, vertical: 24 })]}
          >
            {manga.genres?.map((g) => (
              <Chip key={g} size="sm">
                <Chip.Label>{g}</Chip.Label>
              </Chip>
            ))}
          </HStack>
        </ScrollView>
      )}

      <VStack
        alignment="leading"
        spacing={24}
        modifiers={[
          padding({
            horizontal: GUTTER_X,
            top: hasGenres ? 0 : 24,
            bottom: 24,
          }),
        ]}
      >
        <Tracking manga={manga} />
        <Synopsis text={manga.description} />
      </VStack>
    </VStack>
  );
}
