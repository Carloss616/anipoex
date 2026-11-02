import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Sheet } from "panelui-web/sheet";
import type { ReactNode } from "react";
import { View } from "react-native";
import { SHEET_INSET } from "@/components/ui/bottom-sheet";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
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
  /** Opens a field's view on iOS and Android; on web each cell opens its Sheet.Next. */
  onEdit: (field: Field) => void;
  onRemove: () => void;
  canRemove: boolean;
  removing: boolean;
  /** Off until the viewer's score format is known: the fallback scale would save it wrong. */
  canScore: boolean;
}

/** A cell that opens its field's Sheet.Next. */
function Cell({
  field,
  disabled,
  children,
}: {
  field: Field;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Sheet.Trigger
      to={field}
      disabled={disabled}
      render={<Button variant="ghost" size="lg" className="flex-1" />}
    >
      {children}
    </Sheet.Trigger>
  );
}

/** The sheet at rest: what the entry says, one cell per field. */
export function Overview({
  title,
  form,
  onRemove,
  canRemove,
  removing,
  canScore,
}: OverviewProps) {
  const status = form.status && MANGA_STATUSES[form.status];

  return (
    <>
      <Sheet.Header className={SHEET_INSET.header}>
        <View className="flex-row items-center gap-2">
          <Sheet.Title className="min-w-0 truncate">{title}</Sheet.Title>
          <ButtonGroup aria-label="Entry actions" className="ms-auto">
            <Menu items={[removeItem(onRemove, !canRemove || removing)]}>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <Icon name={Icons.more} size={BUTTON_ICON_SIZE} />
              </Button>
            </Menu>
          </ButtonGroup>
        </View>
      </Sheet.Header>

      <Sheet.Body className={SHEET_INSET.body}>
        <ButtonGroup orientation="vertical" className="w-full">
          <ButtonGroup
            aria-label="Status, progress and score"
            className="w-full"
          >
            <Cell field="status">
              {status ?? form.status ?? <Muted>Status</Muted>}
            </Cell>
            <Cell field="progress">
              {form.progress || <Muted>Progress</Muted>}
            </Cell>
            <Cell field="score" disabled={!canScore}>
              {form.score || <Muted>Score</Muted>}
            </Cell>
          </ButtonGroup>
          <ButtonGroup aria-label="Dates" className="w-full">
            <Cell field="startedAt">
              {formatDate(form.startedAt) || <Muted>Start date</Muted>}
            </Cell>
            <Cell field="completedAt">
              {formatDate(form.completedAt) || <Muted>Finish date</Muted>}
            </Cell>
          </ButtonGroup>
        </ButtonGroup>
      </Sheet.Body>
    </>
  );
}

const Muted = ({ children }: { children: ReactNode }) => (
  <Typography weight="medium" muted className="text-[0.9375rem]">
    {children}
  </Typography>
);
