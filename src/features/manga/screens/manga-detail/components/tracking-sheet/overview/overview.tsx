import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { Separator } from "@/components/ui/separator";
import { Surface } from "@/components/ui/surface";
import { Typography } from "@/components/ui/typography";
import { MANGA_STATUSES } from "@/features/manga/constants";
import type { TrackingForm } from "@/features/manga/utils/tracking-form";
import { formatDate } from "@/utils/utils";
import { removeItem } from "./utils/remove-item";

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
  const status = form.status && MANGA_STATUSES[form.status];

  const { isLandscape } = useBreakpoint();

  return (
    <Column className="pt-4">
      <Row alignment="center" className="gap-2 px-4">
        <Typography type="h4" numberOfLines={1}>
          {title}
        </Typography>
        <Spacer flexible />
        <Menu items={[removeItem(onRemove, !canRemove || removing)]}>
          <Button variant="outline" size="icon" className="size-9">
            <Icon
              name={Icons.more}
              size={BUTTON_ICON_SIZE}
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
                className="flex-1"
                onPress={() => onEdit("status")}
              >
                {status ?? form.status ?? <Typography muted>Status</Typography>}
              </Button>
              <Separator orientation="vertical" />
              <Button
                variant="ghost"
                className="flex-1"
                onPress={() => onEdit("progress")}
              >
                {form.progress || <Typography muted>Progress</Typography>}
              </Button>
              <Separator orientation="vertical" />
              <Button
                variant="ghost"
                className="flex-1"
                onPress={() => onEdit("score")}
              >
                {form.score || <Typography muted>Score</Typography>}
              </Button>
            </Row>
            <Separator />
            <Row className="w-full">
              <Button
                variant="ghost"
                className="flex-1"
                onPress={() => onEdit("startedAt")}
              >
                {formatDate(form.startedAt) || (
                  <Typography muted>Start date</Typography>
                )}
              </Button>
              <Separator orientation="vertical" />
              <Button
                variant="ghost"
                className="flex-1"
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
