import {
  Column,
  HorizontalDivider,
  IconButton,
  Row,
  Shape,
  Surface,
  TextButton,
  VerticalDivider,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { MANGA_STATUSES } from "@/features/manga/constants";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { formatDate } from "@/utils/utils";
import type { OverviewProps } from "./overview";
import { removeItem } from "./utils/remove-item";

/** The M3 minimum touch target: a cell's height, and the rule between cells. */
const CELL_HEIGHT = 48;
const RADIUS = 12;

interface CellProps {
  value: string | number | null | undefined;
  /** The field's name, dimmed, while it has no value. */
  placeholder: string;
  onPress: () => void;
  isDisabled?: boolean;
}

function Cell({ value, placeholder, onPress, isDisabled = false }: CellProps) {
  const m3 = useThemeM3Colors();

  return (
    <TextButton
      enabled={!isDisabled}
      onClick={onPress}
      modifiers={[weight(1), height(CELL_HEIGHT)]}
    >
      <Text color={value ? undefined : m3.onSurfaceVariant}>
        {value || placeholder}
      </Text>
    </TextButton>
  );
}

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({ onPress }: { onPress?: () => void }) {
  return (
    <IconButton onClick={onPress}>
      <Icon name={Icons.more} size={BUTTON_ICON_SIZE} color="inherit" />
    </IconButton>
  );
}

/** A tonal card of the entry's fields, under the title and its menu. */
export function Overview({
  title,
  form,
  onEdit,
  onRemove,
  canRemove,
  removing,
  canScore,
}: OverviewProps) {
  const { isLandscape } = useBreakpoint();
  const rule = <VerticalDivider modifiers={[height(CELL_HEIGHT)]} />;

  return (
    <Column>
      <Row
        verticalAlignment="center"
        horizontalArrangement={{ spacedBy: 8 }}
        modifiers={[padding(16, 0, 16, 0)]}
      >
        <Text
          style={{ typography: "titleLarge" }}
          maxLines={1}
          overflow="ellipsis"
          modifiers={[weight(1)]}
        >
          {title}
        </Text>
        <Menu items={[removeItem(onRemove, !canRemove || removing)]}>
          <MoreButton />
        </Menu>
      </Row>

      <Column
        modifiers={[
          fillMaxWidth(),
          // Leftover height in a landscape sheet, so the card scrolls inside it.
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
        ]}
      >
        <Surface
          tonalElevation={3}
          shape={Shape.RoundedCorner({
            cornerRadii: {
              topStart: RADIUS,
              topEnd: RADIUS,
              bottomStart: RADIUS,
              bottomEnd: RADIUS,
            },
          })}
          modifiers={[padding(16, 16, 16, 16), fillMaxWidth()]}
        >
          <Column>
            <Row modifiers={[fillMaxWidth()]}>
              <Cell
                value={form.status && MANGA_STATUSES[form.status]}
                placeholder="Status"
                onPress={() => onEdit("status")}
              />
              {rule}
              <Cell
                value={form.progress}
                placeholder="Progress"
                onPress={() => onEdit("progress")}
              />
              {rule}
              <Cell
                value={form.score}
                placeholder="Score"
                onPress={() => onEdit("score")}
                isDisabled={!canScore}
              />
            </Row>
            <HorizontalDivider />
            <Row modifiers={[fillMaxWidth()]}>
              <Cell
                value={formatDate(form.startedAt)}
                placeholder="Start date"
                onPress={() => onEdit("startedAt")}
              />
              {rule}
              <Cell
                value={formatDate(form.completedAt)}
                placeholder="Finish date"
                onPress={() => onEdit("completedAt")}
              />
            </Row>
          </Column>
        </Surface>
      </Column>
    </Column>
  );
}
