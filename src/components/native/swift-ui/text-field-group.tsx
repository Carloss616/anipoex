import { Button, HStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  foregroundStyle,
  frame,
  glassEffect,
  labelStyle,
  padding,
} from "@expo/ui/swift-ui/modifiers";

export const HEIGHT = 48;

export type TextFieldGroupProps = {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  children: React.ReactNode;
  clearLabel?: string;
  clearAction?: () => void;
  showClear?: boolean;
};

export function TextFieldGroup({
  prefix,
  suffix,
  children,
  clearLabel = "Clear",
  clearAction,
  showClear,
}: TextFieldGroupProps) {
  return (
    <HStack
      spacing={8}
      modifiers={[
        padding({ horizontal: 16 }),
        frame({
          maxWidth: Infinity,
          minHeight: HEIGHT,
          maxHeight: HEIGHT,
        }),
        glassEffect({
          glass: { variant: "regular", interactive: true },
          shape: "capsule",
        }),
      ]}
    >
      {prefix}
      {children}
      {showClear ? (
        <Button
          label={clearLabel}
          systemImage="xmark.circle.fill"
          onPress={clearAction}
          modifiers={[
            labelStyle("iconOnly"),
            buttonStyle("plain"),
            foregroundStyle("secondary"),
          ]}
        />
      ) : null}
      {suffix}
    </HStack>
  );
}
