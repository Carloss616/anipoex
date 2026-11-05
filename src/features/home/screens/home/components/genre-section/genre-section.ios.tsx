import { HStack, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityAddTraits,
  background,
  clipShape,
  foregroundStyle,
  frame,
  lineLimit,
  onTapGesture,
  padding,
  scrollIndicators,
} from "@expo/ui/swift-ui/modifiers";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/swift-ui/text";
import type { GenreSectionProps } from "./genre-section";

/** Dark enough under white text; a genre keeps its color by its name. */
const TILE_COLORS = [
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#ea580c",
  "#16a34a",
  "#2563eb",
  "#c026d3",
  "#b45309",
];

const colorOf = (genre: string) =>
  TILE_COLORS[
    [...genre].reduce((sum, char) => sum + char.charCodeAt(0), 0) %
      TILE_COLORS.length
  ];

/** Two rows of tiles, scrolling sideways by column. */
export function GenreSection({ title, genres }: GenreSectionProps) {
  const router = useRouter();
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
      <ScrollView axes="horizontal" modifiers={[scrollIndicators("hidden")]}>
        <HStack spacing={10} modifiers={[padding({ horizontal: GUTTER })]}>
          {columns.map((column) => (
            <VStack key={column[0]} spacing={10} alignment="leading">
              {column.map((genre) => (
                <Text
                  key={genre}
                  textStyle="subheadline"
                  weight="semibold"
                  modifiers={[
                    foregroundStyle("#ffffff"),
                    lineLimit(1),
                    padding({ horizontal: 12, vertical: 10 }),
                    frame({
                      width: 150,
                      height: 64,
                      alignment: "bottomLeading",
                    }),
                    background(colorOf(genre)),
                    clipShape("roundedRectangle", 14),
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
