import {
  Badge as BadgeView,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "heroui-native/hooks";
import type { BadgeColor, BadgeProps } from "./badge";
import { Host, useIsInsideHost } from "./host";
import { Typography } from "./typography";

/** Seeds an M3 scheme off the semantic color, so it harmonizes with the theme. */
function useColors(color: BadgeColor) {
  const seedColor = useThemeColor(color === "default" ? "accent" : color);
  const m3 = useMaterialColors({ seedColor });

  // `default` is the neutral badge — a seeded `primary` would read as accent.
  return color === "default"
    ? { container: m3.surfaceContainerHighest, content: m3.onSurface }
    : { container: m3.primary, content: m3.onPrimary };
}

/**
 * Android Badge: same props as [the web one](./badge.tsx), drawn as M3's
 * `Badge`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/
 */
export function Badge({ children, color = "default", testID }: BadgeProps) {
  const { container, content } = useColors(color);
  const isInsideHost = useIsInsideHost();

  const badge = (
    <BadgeView
      containerColor={container}
      contentColor={content}
      modifiers={testID ? [testIDModifier(testID)] : []}
    >
      {children == null ? null : (
        <Typography type="body-xs" weight="medium" style={{ color: content }}>
          {children}
        </Typography>
      )}
    </BadgeView>
  );

  return isInsideHost ? badge : <Host matchContents>{badge}</Host>;
}
