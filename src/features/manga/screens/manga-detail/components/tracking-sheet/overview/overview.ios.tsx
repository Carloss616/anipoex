import {
  Button,
  Divider,
  HStack,
  ScrollView,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  fixedSize,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  lineLimit,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { MANGA_STATUSES } from "@/features/manga/constants";
import { formatDate } from "@/utils/utils";
import type { OverviewProps } from "./overview";
import { removeItem } from "./utils/remove-item";

interface CellProps {
  value: string | number | null | undefined;
  /** The field's name, dimmed, while it has no value. */
  placeholder: string;
  onPress: () => void;
}

/** A borderless button taking an even share of its row; the label wears the tint. */
function Cell({ value, placeholder, onPress }: CellProps) {
  return (
    <Button
      onPress={onPress}
      modifiers={[buttonStyle("borderless"), frame({ maxWidth: Infinity })]}
    >
      <Text
        modifiers={[
          ...(value ? [] : [foregroundStyle("secondary")]),
          padding({ vertical: 12 }),
        ]}
      >
        {value || placeholder}
      </Text>
    </Button>
  );
}

/** A Liquid Glass grid of the entry's fields, under the title and its menu. */
export function Overview({
  title,
  form,
  onEdit,
  onRemove,
  canRemove,
  removing,
}: OverviewProps) {
  const { isLandscape } = useBreakpoint();

  return (
    <VStack alignment="leading" spacing={0} modifiers={[padding({ top: 16 })]}>
      <HStack spacing={8} modifiers={[padding({ horizontal: 16 })]}>
        <Text textStyle="title3" modifiers={[lineLimit(1)]}>
          {title}
        </Text>
        <Spacer />
        <Menu items={[removeItem(onRemove, !canRemove || removing)]}>
          <Button
            modifiers={[
              buttonStyle("glass"),
              buttonBorderShape("circle"),
              labelStyle("iconOnly"),
              foregroundStyle("secondary"),
            ]}
          >
            <Icon
              name={Icons.more}
              size={18}
              color="inherit"
              modifiers={[frame({ width: 20, height: 20 })]}
            />
          </Button>
        </Menu>
      </HStack>

      {/* Hugs the grid in a fit-to-contents sheet; landscape wants the greed. */}
      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack
          spacing={0}
          modifiers={[
            frame({ maxWidth: Infinity }),
            glassEffect({
              glass: { variant: "regular" },
              shape: "roundedRectangle",
              cornerRadius: 24,
            }),
            padding({ all: 16 }),
          ]}
        >
          <HStack spacing={0}>
            <Cell
              value={form.status && MANGA_STATUSES[form.status]}
              placeholder="Status"
              onPress={() => onEdit("status")}
            />
            <Divider />
            <Cell
              value={form.progress}
              placeholder="Progress"
              onPress={() => onEdit("progress")}
            />
            <Divider />
            <Cell
              value={form.score}
              placeholder="Score"
              onPress={() => onEdit("score")}
            />
          </HStack>
          <Divider />
          <HStack spacing={0}>
            <Cell
              value={formatDate(form.startedAt)}
              placeholder="Start date"
              onPress={() => onEdit("startedAt")}
            />
            <Divider />
            <Cell
              value={formatDate(form.completedAt)}
              placeholder="Finish date"
              onPress={() => onEdit("completedAt")}
            />
          </HStack>
        </VStack>
      </ScrollView>
    </VStack>
  );
}
