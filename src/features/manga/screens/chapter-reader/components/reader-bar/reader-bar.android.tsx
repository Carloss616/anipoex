import { Column, IconButton, Row } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxWidth,
  padding,
  Shapes,
  semantics,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { Computed } from "@legendapp/state/react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GUTTER } from "@/components/native/constants";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { BUTTON_ICON_SIZE, Icon, Icons } from "@/components/ui/icon";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import type { ReaderBarProps } from "./reader-bar";

export function ReaderBar({
  chapter,
  subtitle,
  visible,
  page$,
  count,
  onBack,
}: ReaderBarProps) {
  const insets = useSafeAreaInsets();
  const m3 = useThemeM3Colors();

  if (!visible) return null;

  return (
    <>
      <Host
        matchContents={{ vertical: true }}
        className="absolute inset-x-0 top-0"
      >
        <Row
          verticalAlignment="center"
          horizontalArrangement={{ spacedBy: 8 }}
          modifiers={[
            fillMaxWidth(),
            background(m3.surfaceContainer),
            padding(8, insets.top + 8, GUTTER, 8),
          ]}
        >
          <IconButton
            onClick={onBack}
            modifiers={[semantics({ contentDescription: "Back" })]}
          >
            <Icon name={Icons.back} size={BUTTON_ICON_SIZE} color="inherit" />
          </IconButton>
          <Column modifiers={[weight(1)]}>
            <Text
              style={{ typography: "titleMedium" }}
              maxLines={1}
              overflow="ellipsis"
            >
              {chapter}
            </Text>
            <Text
              style={{ typography: "bodySmall" }}
              color={m3.onSurfaceVariant}
              maxLines={1}
              overflow="ellipsis"
            >
              {subtitle}
            </Text>
          </Column>
        </Row>
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
                  style={{ typography: "labelMedium" }}
                  color={m3.onSurfaceVariant}
                  modifiers={[
                    clip(Shapes.Circle),
                    background(m3.surfaceContainer),
                    padding(12, 6, 12, 6),
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
