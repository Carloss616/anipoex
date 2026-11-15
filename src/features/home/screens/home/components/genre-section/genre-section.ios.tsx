import { HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  contentShape,
  foregroundStyle,
  frame,
  glassEffect,
  lineLimit,
  onTapGesture,
  padding,
  scrollClipDisabled,
  scrollIndicators,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import { sourceColor } from "@/features/manga/utils/source";
import { themeMode$ } from "@/state/theme";
import type { GenreSectionProps } from "./genre-section";

/** Two rows of tiles, scrolling sideways by column. */
export function GenreSection({ title, genres }: GenreSectionProps) {
  const router = useRouter();
  const mode = useValue(themeMode$);
  const columns = genres.flatMap((_, i) =>
    i % 2 ? [] : [genres.slice(i, i + 2)],
  );

  return (
    <VStack alignment="leading" spacing={8}>
      <Text
        textStyle="title3"
        weight="bold"
        modifiers={[padding({ horizontal: GUTTER })]}
      >
        {title}
      </Text>
      <ScrollView
        axes="horizontal"
        modifiers={[scrollIndicators("hidden"), scrollClipDisabled()]}
      >
        <HStack spacing={10} modifiers={[padding({ horizontal: GUTTER })]}>
          {columns.map((column) => (
            <VStack key={column[0]} spacing={10} alignment="leading">
              {column.map((genre) => (
                <Text
                  key={genre}
                  textStyle="subheadline"
                  weight="semibold"
                  modifiers={[
                    foregroundStyle("primary"),
                    lineLimit(1),
                    padding({ horizontal: 12, vertical: 10 }),
                    frame({
                      width: 150,
                      height: 64,
                      alignment: "bottomLeading",
                    }),
                    glassEffect({
                      glass: {
                        variant: "regular",
                        interactive: true,
                        tint: sourceColor({ name: genre }, mode),
                      },
                      shape: "roundedRectangle",
                      cornerRadius: 14,
                    }),
                    contentShape(shapes.roundedRectangle({ cornerRadius: 14 })),
                    onTapGesture(() =>
                      router.push({ pathname: "/search", params: { genre } }),
                    ),
                    accessibilityAddTraits(["isButton"]),
                  ]}
                >
                  {genre}
                </Text>
              ))}
            </VStack>
          ))}
        </HStack>
      </ScrollView>
    </VStack>
  );
}
