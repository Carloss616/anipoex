import { Box } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  matchParentSize,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet, View } from "react-native";
import { Column } from "../../layout/column";
import { RNHostView } from "../host";
import type { ScrimProps } from "./scrim";

/**
 * Android Scrim: same props as [the web one](./scrim.tsx), drawn as a band ramp
 * behind a Jetpack Compose `Box` of content.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/box/
 */
export function Scrim({ children, style, className }: ScrimProps) {
  return (
    <Box modifiers={[fillMaxWidth()]}>
      {/* `matchParentSize` keeps the ramp out of the box's measurement, so the
          content is what sets the height. */}
      <Column modifiers={[matchParentSize()]}>
        <RNHostView className="flex-1">
          <View className="scrim flex-1" />
        </RNHostView>
      </Column>
      <Column
        modifiers={[fillMaxWidth()]}
        style={StyleSheet.flatten(style)}
        className={className}
      >
        {children}
      </Column>
    </Box>
  );
}
