import { Column, FilterChip, Row } from "@expo/ui/jetpack-compose";
import { horizontalScroll, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { MangaCard } from "@/features/manga/components/manga-card";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import type { DetailHeaderProps } from "./detail-header";

export function DetailHeader({ manga }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
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
          {manga.genres?.map((g) => (
            <FilterChip key={g} selected={false}>
              <FilterChip.Label>
                <Text style={{ typography: "labelLarge" }}>{g}</Text>
              </FilterChip.Label>
            </FilterChip>
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
