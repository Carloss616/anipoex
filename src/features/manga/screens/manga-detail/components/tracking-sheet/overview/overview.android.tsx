import {
  Column,
  IconButton,
  Row,
  Shape,
  Surface,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import {
  SEGMENTED_CORNER,
  SEGMENTED_GAP,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { MANGA_STATUSES } from "@/features/manga/constants";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { formatDate } from "@/utils/utils";
import type { OverviewProps } from "./overview";
import { removeItem } from "./utils/remove-item";

interface FieldProps {
  label: string;
  icon: IconName;
  value: string | number | null | undefined;
  /** Which outer corners it takes, by its place in the group. */
  corners: Partial<
    Record<"topStart" | "topEnd" | "bottomStart" | "bottomEnd", true>
  >;
  onPress: () => void;
  isDisabled?: boolean;
  /** The secondary container, for the field read most. */
  accent?: boolean;
}

/** One piece of the connected group: its name always shown, the value under it. */
function Field({
  label,
  icon,
  value,
  corners,
  onPress,
  isDisabled = false,
  accent = false,
}: FieldProps) {
  const m3 = useThemeM3Colors();
  const r = (corner: keyof FieldProps["corners"]) =>
    corners[corner] ? SEGMENTED_CORNER.outer : SEGMENTED_CORNER.inner;
  const empty = value === null || value === undefined || value === "";

  return (
    <Surface
      onClick={onPress}
      enabled={!isDisabled}
      color={accent ? m3.secondaryContainer : m3.surfaceContainerHighest}
      shape={Shape.RoundedCorner({
        cornerRadii: {
          topStart: r("topStart"),
          topEnd: r("topEnd"),
          bottomStart: r("bottomStart"),
          bottomEnd: r("bottomEnd"),
        },
      })}
      modifiers={[weight(1)]}
    >
      <Column
        verticalArrangement={{ spacedBy: 2 }}
        modifiers={[padding(12, 10, 12, 10)]}
      >
        <Row verticalAlignment="center" horizontalArrangement={{ spacedBy: 4 }}>
          <Icon name={icon} size={14} color={m3.onSurfaceVariant} />
          <Text
            style={{ typography: "labelMedium" }}
            color={m3.onSurfaceVariant}
            maxLines={1}
          >
            {label}
          </Text>
        </Row>
        <Text
          style={{ typography: "titleMedium" }}
          color={empty || isDisabled ? m3.onSurfaceVariant : undefined}
          maxLines={1}
          overflow="ellipsis"
        >
          {empty ? "–" : String(value)}
        </Text>
      </Column>
    </Surface>
  );
}

/** The menu hands its trigger an `onPress` to open it. */
function MoreButton({ onPress }: { onPress?: () => void }) {
  return (
    <IconButton onClick={onPress}>
      <Icon
        name={Icons.more}
        accessibilityLabel="More options"
        color="inherit"
      />
    </IconButton>
  );
}

/** The entry's fields as a connected group, under the title and its menu. */
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
          // Leftover height in a landscape sheet, so the card scrolls in it.
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
        ]}
      >
        <Column
          verticalArrangement={{ spacedBy: SEGMENTED_GAP }}
          modifiers={[padding(16, 16, 16, 16), fillMaxWidth()]}
        >
          <Row
            horizontalArrangement={{ spacedBy: SEGMENTED_GAP }}
            modifiers={[fillMaxWidth()]}
          >
            <Field
              label="Status"
              icon={Icons.list}
              value={form.status && MANGA_STATUSES[form.status]}
              corners={{ topStart: true }}
              onPress={() => onEdit("status")}
              accent
            />
            <Field
              label="Progress"
              icon={Icons.read}
              value={form.progress}
              corners={{}}
              onPress={() => onEdit("progress")}
            />
            <Field
              label="Score"
              icon={Icons.star}
              value={form.score || null}
              corners={{ topEnd: true }}
              onPress={() => onEdit("score")}
              isDisabled={!canScore}
            />
          </Row>
          <Row
            horizontalArrangement={{ spacedBy: SEGMENTED_GAP }}
            modifiers={[fillMaxWidth()]}
          >
            <Field
              label="Started"
              icon={Icons.calendar}
              value={formatDate(form.startedAt)}
              corners={{ bottomStart: true }}
              onPress={() => onEdit("startedAt")}
            />
            <Field
              label="Finished"
              icon={Icons.calendar}
              value={formatDate(form.completedAt)}
              corners={{ bottomEnd: true }}
              onPress={() => onEdit("completedAt")}
            />
          </Row>
        </Column>
      </Column>
    </Column>
  );
}
