import { Circle, HStack } from "@expo/ui/swift-ui";
import {
  background,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SEMANTIC_COLOR } from "../colors";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import { Typography } from "../typography";
import type { BadgeProps } from "./badge";

/** Matches the `size-2` dot the shared Badge draws. */
const DOT = 8;

/**
 * iOS Badge: same props as [the web one](./badge.tsx), a SwiftUI `Text` in a
 * capsule — SwiftUI's own badge is a List/TabView modifier, not a view.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/hstack/
 */
export function Badge({
  children,
  color = "secondary",
  icon,
  testID,
}: BadgeProps) {
  // No native badge to inherit from: `destructive` is the red it would be.
  const { token } = SEMANTIC_COLOR[color === "inherit" ? "destructive" : color];
  const [container, content] = useThemeColor([token.fill, token.label]);
  return (
    <EnsureHost matchContents>
      {icon ? (
        <HStack
          testID={testID}
          modifiers={[
            frame({ width: 20, height: 20 }),
            background(container, shapes.circle()),
          ]}
        >
          <Icon name={icon} size={11} color={content} />
        </HStack>
      ) : children == null ? (
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
            foregroundStyle(content),
          ]}
        >
          <Typography type="body-xs" weight="medium" className="text-inherit">
            {children}
          </Typography>
        </HStack>
      )}
    </EnsureHost>
  );
}
