import { cn } from "panelui-native/utils/cn";
import { ScrollView, View } from "react-native";
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
    <View className="gutters pt-gt">
      <View className="gutters flex-row items-end gap-4 px-gx">
        <MangaCard
          cover={manga.coverImage?.large}
          coverThumb={manga.coverImage?.medium}
          coverColor={manga.coverImage?.color}
          accessibilityLabel={manga.title?.userPreferred ?? undefined}
          testID="manga-detail-cover"
          style={{ width: 144 }}
        />
        <Meta manga={manga} className="flex-1" />
      </View>

      {!!manga.genres?.length && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="gutters flex-row gap-2 px-gx py-6">
            {manga.genres.map((g) => (
              <Chip key={g} size="sm">
                <Chip.Label>{g}</Chip.Label>
              </Chip>
            ))}
          </View>
        </ScrollView>
      )}

      <View
        className={cn(
          "gutters gap-6 px-gx pb-6",
          !manga.genres?.length && "pt-6",
        )}
      >
        <Tracking manga={manga} />
        <Synopsis text={manga.description} />
      </View>
    </View>
  );
}
