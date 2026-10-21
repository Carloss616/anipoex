// biome-ignore lint/style/noRestrictedImports: the 48pt face; the house Text's font would win
import { Button, Text as TextBase, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  controlSize,
  font,
  foregroundStyle,
  frame,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { EnsureHost } from "@/components/ui/host";
import { useFontFamily } from "@/hooks/use-font";
import type { EmptyStateProps } from "./empty-state";
import { useFace } from "./hooks/use-face";

const MUTED = [foregroundStyle("secondary"), multilineTextAlignment("center")];

export function EmptyState({
  title,
  description,
  action,
  children,
  modifiers,
}: EmptyStateProps) {
  const face = useFace();
  const family = useFontFamily("normal");
  const buttonFont = useFont("subheadline", "medium");

  return (
    <EnsureHost className="flex-1">
      <VStack
        spacing={12}
        modifiers={[
          padding({ horizontal: 32, vertical: 96 }),
          frame({ maxWidth: Infinity, maxHeight: Infinity }),
          ...(modifiers ?? []),
        ]}
      >
        {/* Larger than any text style: the face is art, not text. */}
        <TextBase
          modifiers={[
            font({ textStyle: "largeTitle", size: 48, family }),
            ...MUTED,
          ]}
        >
          {face}
        </TextBase>
        <Text textStyle="headline" weight="medium" modifiers={MUTED}>
          {title}
        </Text>
        {description && (
          <Text textStyle="caption" modifiers={MUTED}>
            {description}
          </Text>
        )}
        {action && (
          <Button
            label={action.label}
            onPress={action.onPress}
            modifiers={[buttonStyle("glass"), controlSize("small"), buttonFont]}
          />
        )}
        {children}
      </VStack>
    </EnsureHost>
  );
}
