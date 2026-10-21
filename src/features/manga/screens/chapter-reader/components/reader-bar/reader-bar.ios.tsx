import { Button, HStack, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  background,
  buttonBorderShape,
  buttonStyle,
  foregroundStyle,
  frame,
  labelStyle,
  lineLimit,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import type { ReaderBarProps } from "./reader-bar";

const MATERIAL = { type: "material", material: "bar" } as const;

export function ReaderBar({
  chapter,
  subtitle,
  visible,
  page$,
  count,
  onBack,
}: ReaderBarProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <>
      <Host
        matchContents={{ vertical: true }}
        ignoreSafeArea="all"
        className="absolute inset-x-0 top-0"
      >
        <HStack
          spacing={8}
          modifiers={[
            padding({ top: insets.top + 8, bottom: 8, horizontal: 8 }),
            frame({ maxWidth: Infinity, alignment: "leading" }),
            background(MATERIAL),
          ]}
        >
          <Button
            onPress={onBack}
            modifiers={[
              buttonStyle("glass"),
              buttonBorderShape("circle"),
              labelStyle("iconOnly"),
              accessibilityLabel("Back"),
            ]}
          >
            <Icon name={Icons.back} size={BUTTON_ICON_SIZE} color="inherit" />
          </Button>
          <VStack alignment="leading" spacing={2}>
            <Text
              textStyle="subheadline"
              weight="semibold"
              modifiers={[lineLimit(1)]}
            >
              {chapter}
            </Text>
            <Text
              textStyle="caption"
              modifiers={[foregroundStyle("secondary"), lineLimit(1)]}
            >
              {subtitle}
            </Text>
          </VStack>
        </HStack>
      </Host>
      {count > 0 && (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 items-center"
          style={{ bottom: insets.bottom + 24 }}
        >
          <Host matchContents>
            <Computed>
              {() => (
                <Text
                  textStyle="caption"
                  modifiers={[
                    foregroundStyle("secondary"),
                    padding({ horizontal: 12, vertical: 6 }),
                    background(MATERIAL, shapes.capsule()),
                  ]}
                >
                  {page$.get()} / {count}
                </Text>
              )}
            </Computed>
          </Host>
        </View>
      )}
    </>
  );
}
