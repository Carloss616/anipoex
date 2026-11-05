import { Box, Column, LazyRow } from "@expo/ui/jetpack-compose";
import {
  background,
  clickable,
  clip,
  padding,
  Shapes,
  semantics,
  size,
  width,
} from "@expo/ui/jetpack-compose/modifiers";
import { useRouter } from "expo-router";
import { GUTTER } from "@/components/native/constants";
import { SectionHeader } from "@/components/native/jetpack-compose/section-header";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { GenreSectionProps } from "./genre-section";

const TILE = 64;
// Room for a long genre name under the tile.
const COLUMN = 88;
const SHAPES = [
  Shapes.Material.Cookie4Sided,
  Shapes.Material.Clover4Leaf,
  Shapes.Material.Sunny,
  Shapes.Material.Pill,
  Shapes.Material.Arch,
  Shapes.Material.Cookie6Sided,
  Shapes.Material.Slanted,
  Shapes.Material.Puffy,
];

/** Two rows of Expressive shapes, scrolling sideways; each opens /search. */
export function GenreSection({ title, genres }: GenreSectionProps) {
  const pairs = genres.flatMap((_, i) =>
    i % 2 ? [] : [genres.slice(i, i + 2)],
  );

  return (
    <Column>
      <SectionHeader title={title} />
      <LazyRow
        horizontalArrangement={{ spacedBy: 4 }}
        contentPadding={{ start: GUTTER - 4, end: GUTTER - 4 }}
      >
        <LazyRow.Items
          data={pairs}
          keyExtractor={(pair) => pair.join()}
          estimatedItemSize={COLUMN}
        >
          {({ item: pair, index }) => (
            <Column verticalArrangement={{ spacedBy: 12 }}>
              {pair.map((genre, row) => (
                <GenreTile key={genre} genre={genre} index={index * 2 + row} />
              ))}
            </Column>
          )}
        </LazyRow.Items>
      </LazyRow>
    </Column>
  );
}

function GenreTile({ genre, index }: { genre: string; index: number }) {
  const router = useRouter();
  const m3 = useThemeM3Colors();
  const [container, content] = [
    [m3.primaryContainer, m3.onPrimaryContainer],
    [m3.secondaryContainer, m3.onSecondaryContainer],
    [m3.tertiaryContainer, m3.onTertiaryContainer],
  ][index % 3];

  return (
    <Column
      horizontalAlignment="center"
      verticalArrangement={{ spacedBy: 6 }}
      modifiers={[
        width(COLUMN),
        clip(Shapes.RoundedCorner(12)),
        clickable(() =>
          router.push({ pathname: "/search", params: { genre } }),
        ),
        semantics({ contentDescription: genre }),
        padding(0, 4, 0, 4),
      ]}
    >
      <Box
        contentAlignment="center"
        modifiers={[
          size(TILE, TILE),
          clip(SHAPES[index % SHAPES.length]),
          background(container),
        ]}
      >
        <Text style={{ typography: "titleMedium" }} color={content}>
          {genre.slice(0, 2)}
        </Text>
      </Box>
      <Text
        style={{ typography: "labelMedium", textAlign: "center" }}
        maxLines={1}
        overflow="ellipsis"
      >
        {genre}
      </Text>
    </Column>
  );
}
