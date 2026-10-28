import { Typography } from "panelui-native/components/typography";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import { Badge } from "@/components/ui/badge";
import { Icon, Icons } from "@/components/ui/icon";
import { STATUS_COLOR } from "@/features/manga/components/manga-card/constants";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { metaLines } from "./utils/meta-lines";

export function Meta({
  manga,
  className,
}: {
  manga: MangaDetail;
  className?: string;
}) {
  const { synonyms, state } = metaLines(manga);

  return (
    <View className={cn("items-start gap-2", className)}>
      {!!synonyms && (
        <Typography type="body-sm" muted numberOfLines={3}>
          {synonyms}
        </Typography>
      )}

      {!!manga.author && (
        <View className="flex-row items-center gap-2">
          <Icon name={Icons.person} size={12} muted />
          <Typography type="body-sm" weight="medium">
            {manga.author}
          </Typography>
        </View>
      )}

      {!!state && (
        <View className="flex-row items-center gap-2">
          {manga.status ? (
            <View className="w-3 items-center">
              <Badge color={STATUS_COLOR[manga.status]} />
            </View>
          ) : (
            <Icon name={Icons.calendar} size={12} muted />
          )}
          <Typography type="body-sm" muted>
            {state}
          </Typography>
        </View>
      )}

      {!!manga.averageScore && (
        <View className="flex-row items-center gap-2">
          <Icon name={Icons.star} size={12} muted />
          <Typography type="body-sm" muted>
            {`${manga.averageScore}% community`}
          </Typography>
        </View>
      )}
    </View>
  );
}
