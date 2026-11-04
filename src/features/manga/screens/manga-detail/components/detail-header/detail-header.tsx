import type { Observable } from "@legendapp/state";
import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { cn } from "panelui-native/utils/cn";
import { ScrollView, View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { MangaCard } from "@/features/manga/components/manga-card";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import type { Continue$ } from "../../hooks/use-continue";
import { Meta } from "../meta";
import { metaLines } from "../meta/utils";
import { Synopsis } from "../synopsis";
import { Tracking } from "../tracking";
import { useTitleOut } from "./hooks/use-title-out";

export interface DetailHeaderProps {
  manga: MangaDetail;
  /**
   * Shown before iOS 26, which floats it in the tab bar.
   * @platform ios
   */
  continue$: Continue$;
  /**
   * Opens `continue$`'s action.
   * @platform ios
   */
  onContinue: () => void;
  /**
   * Set while the title is scrolled away, for the header to show it.
   * @platform web
   */
  titleOut$?: Observable<boolean>;
}

/** Everything above the chapters. */
export function DetailHeader({ manga, titleOut$ }: DetailHeaderProps) {
  const wide = useBreakpoint().isAtLeast("lg");
  const titleRef = useTitleOut(titleOut$);
  const title = manga.title?.userPreferred;
  const { synonyms } = metaLines(manga);

  const heading = (
    <View ref={titleRef}>
      <Typography type="h1" numberOfLines={wide ? undefined : 3}>
        {title}
      </Typography>
    </View>
  );

  if (wide)
    return (
      // Beside the side column: 16px from it, the screen's gutter on the right.
      <View className="gutters gap-6 pt-gt pr-gx pb-6 pl-4">
        <View className="gap-2">
          {heading}
          {!!synonyms && (
            <Typography type="body-sm" muted>
              {synonyms}
            </Typography>
          )}
        </View>
        <Synopsis text={manga.description} />
      </View>
    );

  return (
    <View className="gutters pt-gt">
      <View className="gutters flex-row items-end gap-4 px-gx">
        <MangaCard
          cover={manga.coverImage?.large}
          coverThumb={manga.coverImage?.medium}
          coverColor={manga.coverImage?.color}
          accessibilityLabel={title ?? undefined}
          testID="manga-detail-cover"
          style={{ width: 144 }}
          tilt
        />
        <View className="flex-1 gap-3">
          {heading}
          <Meta manga={manga} />
        </View>
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
