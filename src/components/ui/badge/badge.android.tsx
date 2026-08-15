import {
  Badge as BadgeView,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import type { BadgeProps } from "./badge";

/** Seeds an M3 scheme off the semantic color, so it harmonizes with the theme. */
export function useColors(color: SemanticColor) {
  const seedColor = useThemeColor(
    SEMANTIC_COLOR[color === "secondary" ? "primary" : color].token.fill,
  );
  const m3 = useMaterialColors({ seedColor });

  // `secondary` is the neutral badge, so it takes the surface, not the seed.
  return color === "secondary"
    ? { container: m3.surfaceContainerHighest, content: m3.onSurface }
    : { container: m3.primary, content: m3.onPrimary };
}

/**
 * Android Badge: same props as [the web one](./badge.tsx), drawn as M3's
 * `Badge`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/
 */
export function Badge({ children, color = "secondary", testID }: BadgeProps) {
  const { container, content } = useColors(color);

  return (
    <EnsureHost matchContents>
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
    </EnsureHost>
  );
}
