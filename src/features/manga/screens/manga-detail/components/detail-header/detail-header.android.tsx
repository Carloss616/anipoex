import { Column, Row } from "@expo/ui/jetpack-compose";
import { horizontalScroll, padding } from "@expo/ui/jetpack-compose/modifiers";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER_TOP, GUTTER_X } from "@/components/native/gutters";
import { Chip } from "@/components/ui/chip";
import { MangaCard } from "@/features/manga/components/manga-card";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import type { DetailHeaderProps } from "./detail-header";

export function DetailHeader({ manga }: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const hasGenres = !!manga.genres?.length;
  // The page inset clears a landscape cutout, like `px-safe-offset-gx`.
  const start = GUTTER_X + insets.left;
  const end = GUTTER_X + insets.right;

  return (
    <Column modifiers={[padding(0, GUTTER_TOP, 0, 0)]}>
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
          // A style, not a class: the card reads its width back for its height.
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
            <Chip key={g} size="sm">
              <Chip.Label>{g}</Chip.Label>
            </Chip>
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
