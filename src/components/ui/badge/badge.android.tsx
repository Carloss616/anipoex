import { Badge as BadgeView } from "@expo/ui/jetpack-compose";
import { testID as testIDModifier } from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { SEMANTIC_COLOR, type SemanticColor } from "../colors";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import type { BadgeProps } from "./badge";

/**
 * The app scheme's roles where M3 has one (`primary`, `error`, the neutral
 * surface); `success` and `warning` have none, so those seed a scheme of
 * their own, harmonized with the theme the way M3 builds custom colors.
 */
export function useColors(color: SemanticColor | "inherit") {
  const custom = color === "success" || color === "warning";
  const m3 = useThemeM3Colors(
    custom ? SEMANTIC_COLOR[color].token.fill : "primary",
  );

  if (color === "inherit") return { container: undefined, content: undefined };
  if (color === "destructive")
    return { container: m3.error, content: m3.onError };
  // `secondary` is the neutral badge, so it takes the surface, not a role.
  if (color === "secondary")
    return { container: m3.surfaceContainerHighest, content: m3.onSurface };
  return { container: m3.primary, content: m3.onPrimary };
}

/**
 * Android Badge: same props as [the web one](./badge.tsx), drawn as M3's
 * `Badge`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/badge/
 */
export function Badge({
  children,
  color = "secondary",
  icon,
  testID,
}: BadgeProps) {
  const { container, content } = useColors(color);

  return (
    <EnsureHost matchContents>
      <BadgeView
        containerColor={container}
        contentColor={content}
        modifiers={testID ? [testIDModifier(testID)] : []}
      >
        {icon ? (
          <Icon name={icon} size={12} color={content} />
        ) : children == null ? null : (
          // What the BadgeView itself sets: @expo/ui's Text never reads it.
          <Text style={{ typography: "labelSmall" }}>{children}</Text>
        )}
      </BadgeView>
    </EnsureHost>
  );
}
