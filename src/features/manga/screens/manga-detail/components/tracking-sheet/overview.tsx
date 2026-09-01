import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Platform } from "react-native";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Separator } from "@/components/ui/separator";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUSES } from "@/features/manga/screens/manga-list/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { formatDate } from "@/utils/utils";

/** The cells that have a view of their own. Grows as each one lands. */
export type Field =
  | "status"
  | "progress"
  | "score"
  | "startedAt"
  | "completedAt";

export interface OverviewProps {
  title: string;
  form: TrackingForm;
  onEdit: (field: Field) => void;
  onRemove: () => void;
  canRemove: boolean;
  removing: boolean;
}

/** The sheet at rest: what the entry says, one cell per field. */
export function Overview({
  title,
  form,
  onEdit,
  onRemove,
  canRemove,
  removing,
}: OverviewProps) {
  const status = MANGA_STATUSES.find((s) => s.status === form.status)?.title;

  const { isLandscape } = useBreakpoint();

  return (
    <Column className="android:pt-0 pt-4">
      <Row alignment="center" className="gap-2 px-4">
        <Typography type="h4" numberOfLines={1}>
          {title}
        </Typography>
        <Spacer flexible />
        <Menu
          items={[
            {
              label: "Remove from list",
              onPress: onRemove,
              onPressMode: "dialog",
              dialogConfig: {
                title: "Remove from list?",
                description: "This action cannot be undone.",
                confirmLabel: "Remove",
              },
              destructive: true,
              disabled: !canRemove || removing,
            },
          ]}
        >
          <Button
            variant={Platform.OS === "ios" ? "secondary" : "ghost"}
            size="icon"
            className="ios:size-8 size-9"
            muted
          >
            <Icon
              name={Icon.select({
                ios: "ellipsis",
                android: require("@expo/material-symbols/more_vert.xml"),
                web: "more-vertical",
              })}
              size={Platform.select({
                ios: 20,
                android: 24,
                web: 18,
              })}
              className="text-inherit"
            />
          </Button>
        </Menu>
      </Row>

      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4">
          <Surface variant="tertiary" padding="none" className="w-full">
            <Row className="w-full">
              <Button
                variant="ghost"
                className="flex-1 ios:py-3"
                onPress={() => onEdit("status")}
              >
                {status ?? form.status}
              </Button>
              <Separator orientation="vertical" className="android:h-12" />
              <Button
                variant="ghost"
                className="flex-1 ios:py-3"
                onPress={() => onEdit("progress")}
              >
                {form.progress || <Typography muted>Progress</Typography>}
              </Button>
              <Separator orientation="vertical" className="android:h-12" />
              <Button
                variant="ghost"
                className="flex-1 ios:py-3"
                onPress={() => onEdit("score")}
              >
                {form.score || <Typography muted>Score</Typography>}
              </Button>
            </Row>
            <Separator />
            <Row className="w-full">
              <Button
                variant="ghost"
                className="flex-1 ios:py-3"
                onPress={() => onEdit("startedAt")}
              >
                {formatDate(form.startedAt) || (
                  <Typography muted>Start date</Typography>
                )}
              </Button>
              <Separator orientation="vertical" className="android:h-12" />
              <Button
                variant="ghost"
                className="flex-1 ios:py-3"
                onPress={() => onEdit("completedAt")}
              >
                {formatDate(form.completedAt) || (
                  <Typography muted>Finish date</Typography>
                )}
              </Button>
            </Row>
          </Surface>
        </Column>
      </ScrollView>
    </Column>
  );
}
