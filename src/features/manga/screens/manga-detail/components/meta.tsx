import { useIsPreview } from "expo-router";
import { cn } from "heroui-native/utils";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Icon, type IconName } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import type { MangaEntry } from "@/features/manga/utils/to-entries";

type MetaField = {
  icon: IconName;
  value: string;
};

export function Meta({
  manga,
  className,
}: {
  manga: MangaEntry;
  className: string;
}) {
  const isPreview = useIsPreview();

  const fields: MetaField[] = [];

  if (manga.listStatus) {
    fields.push({
      icon: Icon.select({
        ios: "clock",
        android: require("@expo/material-symbols/schedule.xml"),
        web: "clock",
      }),
      value:
        MANGA_STATUSES.find((s) => s.status === manga.listStatus)?.title ??
        manga.listStatus,
    });
  }

  if (manga.year) {
    fields.push({
      icon: Icon.select({
        ios: "calendar",
        android: require("@expo/material-symbols/calendar_today.xml"),
        web: "calendar",
      }),
      value: manga.year,
    });
  }

  if (manga.score != null && manga.score > 0) {
    fields.push({
      icon: Icon.select({
        ios: "star",
        android: require("@expo/material-symbols/star.xml"),
        web: "star",
      }),
      value: String(manga.score),
    });
  }

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      <Typography type="h3" className={cn(!isPreview && "hidden")}>
        {manga.title}
      </Typography>
      {fields.map(({ icon, value }) => (
        <Row key={value} className="gap-1" alignment="center">
          <Icon name={icon} size={12} colorClassName="accent-muted" />
          <Typography type="body-sm" color="muted">
            {value}
          </Typography>
        </Row>
      ))}
    </Column>
  );
}
