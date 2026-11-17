import { HStack } from "@expo/ui/swift-ui";
import {
  accessibilityElement,
  accessibilityLabel as accessibilityLabelModifier,
  background,
  clipShape,
  foregroundStyle,
  lineLimit,
  minimumScaleFactor,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { Text } from "@/components/native/swift-ui/text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SEMANTIC_COLOR } from "../colors";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import type { SplitBadgeProps } from "./split-badge";

/** Square segments in one capsule: only its ends round. */
export function SplitBadge({ segments, accessibilityLabel }: SplitBadgeProps) {
  const colors = useThemeColor(
    segments.flatMap(({ color }) => [
      SEMANTIC_COLOR[color].token.fill,
      SEMANTIC_COLOR[color].token.label,
    ]),
  );
  return (
    <EnsureHost matchContents>
      <HStack
        spacing={0}
        modifiers={[
          clipShape("capsule"),
          ...(accessibilityLabel
            ? [
                accessibilityElement("ignore"),
                accessibilityLabelModifier(accessibilityLabel),
              ]
            : []),
        ]}
      >
        {segments.map(({ color, icon, label }, i) => (
          <HStack
            key={`${color}-${label}`}
            spacing={2}
            modifiers={[
              padding({ horizontal: 6, vertical: 2 }),
              background(colors[i * 2]),
              foregroundStyle(colors[i * 2 + 1]),
            ]}
          >
            {icon && <Icon name={icon} size={10} color={colors[i * 2 + 1]} />}
            <Text
              textStyle="caption"
              weight="medium"
              modifiers={[lineLimit(1), minimumScaleFactor(0.7)]}
            >
              {label}
            </Text>
          </HStack>
        ))}
      </HStack>
    </EnsureHost>
  );
}
