import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Chip } from "@/components/ui/chip";
import { MangaCard } from "@/features/manga/components/manga-card";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { Meta } from "../meta";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";

export interface DetailHeaderProps {
  manga: MangaDetail;
}

/** Everything above the chapters: cover and meta, genres, tracking, synopsis. */
export function DetailHeader({ manga }: DetailHeaderProps) {
  return (
    <Column className="gutters pt-gt">
      <Row className="gutters gap-4 px-gx" alignment="end">
        <MangaCard
          cover={manga.coverImage?.large}
          coverThumb={manga.coverImage?.medium}
          coverColor={manga.coverImage?.color}
          accessibilityLabel={manga.title?.userPreferred ?? undefined}
          testID="manga-detail-cover"
          style={{ width: 144 }}
        />
        <Meta manga={manga} className="self-auto! flex-1" />
      </Row>

      {!!manga.genres?.length && (
        <ScrollView direction="horizontal" showsIndicators={false}>
          <Row className="gutters gap-2 px-gx py-6">
            {manga.genres.map((g) => (
              <Chip key={g} size="sm">
                <Chip.Label>{g}</Chip.Label>
              </Chip>
            ))}
          </Row>
        </ScrollView>
      )}

      <Column
        className={cn(
          "gutters gap-6 px-gx pb-6",
          !manga.genres?.length && "pt-6",
        )}
      >
        <Tracking manga={manga} />
        <Synopsis text={manga.description} />
      </Column>
    </Column>
  );
}
