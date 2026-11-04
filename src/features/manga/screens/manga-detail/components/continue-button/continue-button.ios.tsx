import { Button, HStack } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  frame,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import {
  CONTINUE_LABEL,
  chapterBadge,
} from "@/features/manga/utils/continue-label";
import type { ContinueButtonProps } from "./continue-button";

/** Only before iOS 26, which shows Continue in the tab bar. */
export function ContinueButton({ continue$, onPress }: ContinueButtonProps) {
  const action = useValue(continue$);
  if (!action) return null;
  const label = CONTINUE_LABEL[action.kind];
  const badge = chapterBadge(action.chapter?.number);

  return (
    <Button
      onPress={onPress}
      modifiers={[
        buttonStyle("borderedProminent"),
        buttonBorderShape("capsule"),
        controlSize("large"),
      ]}
    >
      <HStack spacing={8} modifiers={[frame({ maxWidth: Infinity })]}>
        <Icon
          name={action.kind === "pick" ? Icons.search : Icons.play}
          size={15}
          color="inherit"
        />
        <Text>{badge ? `${label} ${badge}` : label}</Text>
      </HStack>
    </Button>
  );
}
