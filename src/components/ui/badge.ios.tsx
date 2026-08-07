import { Circle, HStack } from "@expo/ui/swift-ui";
import {
  background,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import type { BadgeProps } from "./badge";
import { EnsureHost } from "./host";
import { Typography } from "./typography";

/** Matches the `size-2` dot the shared Badge draws. */
const DOT = 8;

/**
 * iOS Badge: same props as [the web one](./badge.tsx), a SwiftUI `Text` in a
 * capsule — SwiftUI's own badge is a List/TabView modifier, not a view.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/hstack/
 */
export function Badge({ children, color = "default", testID }: BadgeProps) {
  const [container, content] = useThemeColor([color, `${color}-foreground`]);
  return (
    <EnsureHost matchContents>
      {children == null ? (
        <Circle
          testID={testID}
          modifiers={[
            frame({ width: DOT, height: DOT }),
            foregroundStyle(container),
          ]}
        />
      ) : (
        <HStack
          testID={testID}
          modifiers={[
            padding({ horizontal: 6, vertical: 2 }),
            background(container, shapes.capsule()),
          ]}
        >
          <Typography type="body-xs" weight="medium" style={{ color: content }}>
            {children}
          </Typography>
        </HStack>
      )}
    </EnsureHost>
  );
}
