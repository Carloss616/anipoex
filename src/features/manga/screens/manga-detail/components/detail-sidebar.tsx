import { Typography } from "panelui-native/components/typography";
import { View } from "react-native";
import { Chip } from "@/components/ui/chip";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import { MangaCard } from "@/features/manga/components/manga-card";
import { ContinueButton } from "./continue-button";
import type { DetailListProps } from "./detail-list";
import { metaLines } from "./meta/utils";
import { Tracking } from "./tracking";

/** The desktop side column beside the chapters: cover, actions, facts. */
export function DetailSidebar({
  manga,
  continue$,
  onContinue,
}: Pick<DetailListProps, "manga" | "continue$" | "onContinue">) {
  const { state } = metaLines(manga);
  const facts: [IconName, string, React.ReactNode][] = [
    [Icons.person, "Author", manga.author],
    [Icons.calendar, "Status", state],
    ["book-open", "Chapters", manga.chapters],
    [Icons.star, "Score", manga.averageScore && `${manga.averageScore}%`],
  ];
  const shown = facts.filter(([, , value]) => !!value);

  return (
    <View className="gap-6">
      <MangaCard
        cover={manga.coverImage?.extraLarge ?? manga.coverImage?.large}
        coverThumb={manga.coverImage?.medium}
        coverColor={manga.coverImage?.color}
        accessibilityLabel={manga.title?.userPreferred ?? undefined}
        testID="manga-detail-cover"
        titlePosition="over"
        style={{ width: "100%" }}
        tilt
      />
      <ContinueButton continue$={continue$} onPress={onContinue} />
      <Tracking manga={manga} />
      <View
        role="list"
        className="grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-6"
      >
        {shown.map(([icon, label, value]) => (
          <View key={label} role="listitem" className="contents">
            <View className="flex-row items-center gap-2">
              <Icon name={icon} size={14} muted />
              <Typography type="body-sm" muted>
                {label}
              </Typography>
            </View>
            <Typography type="body-sm">{value}</Typography>
          </View>
        ))}
      </View>
      {!!manga.genres?.length && (
        <View className="flex-row flex-wrap gap-2">
          {manga.genres.map((g) => (
            <Chip key={g} size="sm">
              <Chip.Label>{g}</Chip.Label>
            </Chip>
          ))}
        </View>
      )}
    </View>
  );
}
