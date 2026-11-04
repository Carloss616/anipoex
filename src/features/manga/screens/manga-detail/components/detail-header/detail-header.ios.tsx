import { HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  background,
  foregroundStyle,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import { HAS_ACCESSORY } from "@/features/manga/components/continue-accessory/constants";
import { MangaCard } from "@/features/manga/components/manga-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { ContinueButton } from "../continue-button";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import type { DetailHeaderProps } from "./detail-header";

export function DetailHeader({
  manga,
  continue$,
  onContinue,
}: DetailHeaderProps) {
  const hasGenres = !!manga.genres?.length;
  // A flag, so a new next chapter re-renders the button, not this header.
  const showContinue = useValue(() => !HAS_ACCESSORY && !!continue$.get());
  const fill = useThemeColor("muted");

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ top: GUTTER })]}
    >
      <HStack
        alignment="bottom"
        spacing={16}
        modifiers={[padding({ horizontal: GUTTER })]}
      >
        <MangaCard
          cover={manga.coverImage?.large}
          coverThumb={manga.coverImage?.medium}
          coverColor={manga.coverImage?.color}
          accessibilityLabel={manga.title?.userPreferred ?? undefined}
          testID="manga-detail-cover"
          style={{ width: 144 }}
        />
        <Meta manga={manga} />
      </HStack>

      {/* iOS 26 shows it in the tab bar accessory. */}
      {showContinue && (
        <VStack modifiers={[padding({ horizontal: GUTTER, top: 24 })]}>
          <ContinueButton continue$={continue$} onPress={onContinue} />
        </VStack>
      )}

      {hasGenres && (
        <ScrollView axes="horizontal" showsIndicators={false}>
          <HStack
            spacing={8}
            modifiers={[padding({ horizontal: GUTTER, vertical: 24 })]}
          >
            {/* Labels, not buttons: a tinted glass capsule says "tap me". */}
            {manga.genres?.map((g) => (
              <Text
                key={g}
                textStyle="caption"
                modifiers={[
                  foregroundStyle("secondary"),
                  padding({ horizontal: 10, vertical: 4 }),
                  background(fill, shapes.capsule()),
                ]}
              >
                {g ?? ""}
              </Text>
            ))}
          </HStack>
        </ScrollView>
      )}

      <VStack
        alignment="leading"
        spacing={24}
        modifiers={[
          padding({
            horizontal: GUTTER,
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
