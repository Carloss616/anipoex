import { Button, HStack, Spacer } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  foregroundStyle,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import type { SFSymbol } from "expo-symbols";
import { memo } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon } from "@/components/ui/icon";
import { cycleFilter, listOptions$ } from "@/features/manga/state/list-options";
import type { TriState } from "@/features/manga/utils/list-options";
import { useThemeColor } from "@/hooks/use-theme-color";
import { FILTER_LABELS, FILTER_STATE_TEXT } from "../constants";
import { filterA11y } from "../utils/labels";
import type { FilterRowProps } from "./filter-row";

const STATE_SYMBOLS: Record<TriState, SFSymbol> = {
  any: "circle",
  include: "checkmark.circle.fill",
  exclude: "xmark.circle.fill",
};

export const FilterRow = memo(function FilterRow({ filter }: FilterRowProps) {
  const state = useValue(() => listOptions$.filters[filter].get());
  const [primary, destructive] = useThemeColor(["primary", "destructive"]);

  return (
    <Button
      onPress={() => cycleFilter(filter)}
      modifiers={[
        buttonStyle("plain"),
        accessibilityLabel(filterA11y(filter, state)),
      ]}
    >
      <HStack spacing={12} modifiers={ROW_FILL}>
        <Icon
          name={STATE_SYMBOLS[state]}
          muted={state === "any"}
          color={
            state === "include"
              ? primary
              : state === "exclude"
                ? destructive
                : undefined
          }
        />
        <Text>{FILTER_LABELS[filter]}</Text>
        <Spacer />
        {state !== "any" && (
          <Text modifiers={[foregroundStyle("secondary")]}>
            {FILTER_STATE_TEXT[state]}
          </Text>
        )}
      </HStack>
    </Button>
  );
});
