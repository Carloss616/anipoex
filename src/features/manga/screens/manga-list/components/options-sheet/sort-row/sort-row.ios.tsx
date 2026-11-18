import { Button, HStack, Spacer } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { chooseSort, listOptions$ } from "@/features/manga/state/list-options";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SORT_LABELS } from "../constants";
import { sortA11y } from "../utils/labels";
import type { SortRowProps } from "./sort-row";

export const SortRow = memo(function SortRow({ by }: SortRowProps) {
  const label = useValue(() => sortA11y(by, listOptions$.sort.get()));
  const ascending = useValue(() => {
    const sort = listOptions$.sort.get();
    return sort.by === by ? sort.ascending : undefined;
  });
  const primary = useThemeColor("primary");
  const active = ascending !== undefined;

  return (
    <Button
      onPress={() => chooseSort(by)}
      modifiers={[buttonStyle("plain"), accessibilityLabel(label)]}
    >
      <HStack spacing={12} modifiers={ROW_FILL}>
        <Text modifiers={active ? [foregroundStyle(primary)] : []}>
          {SORT_LABELS[by]}
        </Text>
        <Spacer />
        {active && (
          <Icon
            name={ascending ? Icons.moveUp : Icons.moveDown}
            color={primary}
          />
        )}
      </HStack>
    </Button>
  );
});
