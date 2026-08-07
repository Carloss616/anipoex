import { useIsPreview } from "expo-router";
import { cn } from "heroui-native/utils";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Icon } from "@/components/ui/icon";
import { Typography } from "@/components/ui/typography";
import { MANGA_DETAIL } from "../../../mocks";

const FIELDS = [
  {
    icon: Icon.select({
      ios: "person",
      android: require("@expo/material-symbols/person.xml"),
      web: "user",
    }),
    value: MANGA_DETAIL.author,
  },
  {
    icon: Icon.select({
      ios: "clock",
      android: require("@expo/material-symbols/schedule.xml"),
      web: "clock",
    }),
    value: MANGA_DETAIL.status,
  },
  {
    icon: Icon.select({
      ios: "calendar",
      android: require("@expo/material-symbols/calendar_today.xml"),
      web: "calendar",
    }),
    value: MANGA_DETAIL.year,
  },
  {
    icon: Icon.select({
      ios: "star",
      android: require("@expo/material-symbols/star.xml"),
      web: "star",
    }),
    value: MANGA_DETAIL.score,
  },
];

export function Meta({ className }: { className: string }) {
  const isPreview = useIsPreview();

  return (
    <Column className={cn("gap-2", className)} alignment="start">
      <Typography type="h3" className={cn(!isPreview && "hidden")}>
        {MANGA_DETAIL.title}
      </Typography>
      {FIELDS.map(({ icon, value }) => (
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
