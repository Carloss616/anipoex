import { Column, Row, Shape, Surface } from "@expo/ui/jetpack-compose";
import { horizontalScroll, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { MangaCard } from "@/features/manga/components/manga-card";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import type { DetailHeaderProps } from "./detail-header";

const TAG = Shape.RoundedCorner({
  cornerRadii: { topStart: 8, topEnd: 8, bottomStart: 8, bottomEnd: 8 },
});

export function DetailHeader({ manga }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();
  const hasGenres = !!manga.genres?.length;
  const start = GUTTER + insets.left;
  const end = GUTTER + insets.right;

  return (
    <Column modifiers={[padding(0, GUTTER, 0, 0)]}>
      <Row
        verticalAlignment="bottom"
        horizontalArrangement={{ spacedBy: 16 }}
        modifiers={[padding(start, 0, end, 0)]}
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
      </Row>

      {hasGenres && (
        <Row
          horizontalArrangement={{ spacedBy: 8 }}
          // After the scroll, so the inset is part of what scrolls.
          modifiers={[horizontalScroll(), padding(start, 24, end, 24)]}
        >
          {/* Labels, not chips: a chip reads as a filter or an action. */}
          {manga.genres?.map((g) => (
            <Surface key={g} color={m3.secondaryContainer} shape={TAG}>
              <Text
                style={{ typography: "labelLarge" }}
                color={m3.onSecondaryContainer}
                modifiers={[padding(12, 6, 12, 6)]}
              >
                {g ?? ""}
              </Text>
            </Surface>
          ))}
        </Row>
      )}

      <Column
        verticalArrangement={{ spacedBy: 24 }}
        modifiers={[padding(start, hasGenres ? 0 : 24, end, 24)]}
      >
        <Tracking manga={manga} />
        <Synopsis text={manga.description} />
      </Column>
    </Column>
  );
}
