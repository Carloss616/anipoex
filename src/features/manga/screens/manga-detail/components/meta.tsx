import { useIsPreview } from "expo-router";
import { cn } from "heroui-native/utils";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Icon, type IconName } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import type { MangaDetail } from "@/features/manga/utils/to-detail";
import { PUBLICATION_STATUSES } from "../constants";

type MetaField = {
  icon: IconName;
  value: string;
};

export function Meta({
  manga,
  className,
}: {
  manga: MangaDetail;
  className: string;
}) {
  const isPreview = useIsPreview();

  // Everything here is optional on AniList, so each field earns its row.
  // The list status is deliberately absent — `Tracking` already owns it.
  const fields: MetaField[] = [];

  if (manga.author) {
    fields.push({
      icon: Icon.select({
        ios: "person",
        android: require("@expo/material-symbols/person.xml"),
        web: "user",
      }),
      value: manga.author,
    });
  }

  if (manga.status) {
    fields.push({
      icon: Icon.select({
        ios: "clock",
        android: require("@expo/material-symbols/schedule.xml"),
        web: "clock",
      }),
      value: PUBLICATION_STATUSES[manga.status],
    });
  }

  if (manga.startDate?.year) {
    fields.push({
      icon: Icon.select({
        ios: "calendar",
        android: require("@expo/material-symbols/calendar_today.xml"),
        web: "calendar",
      }),
      value: String(manga.startDate.year),
    });
  }

  if (manga.mediaListEntry?.score) {
    fields.push({
      icon: Icon.select({
        ios: "star",
        android: require("@expo/material-symbols/star.xml"),
        web: "star",
      }),
      value: String(manga.mediaListEntry.score),
    });
  }

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      <Typography type="h3" className={cn(!isPreview && "hidden")}>
        {manga.title?.userPreferred}
      </Typography>
      {fields.map(({ icon, value }) => (
        <Row key={value} className="gap-1" alignment="center">
          <Icon
            name={icon}
            size={12}
            colorClassName="accent-muted-foreground"
          />
          <Typography type="body-sm" color="muted">
            {value}
          </Typography>
        </Row>
      ))}
    </Column>
  );
}
