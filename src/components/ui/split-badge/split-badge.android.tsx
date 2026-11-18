import { Row } from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxHeight,
  height,
  padding,
  Shapes,
  semantics,
} from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { useColors } from "../badge/badge.android";
import { EnsureHost } from "../host";
import { Icon } from "../icon";
import type { BadgeSegment, SplitBadgeProps } from "./split-badge";

/** One segment: its own hook call, since the segments vary in number. */
function Segment({ color, icon, label }: BadgeSegment) {
  const { container, content } = useColors(color);
  return (
    <Row
      verticalAlignment="center"
      horizontalArrangement={{ spacedBy: 2 }}
      modifiers={[
        fillMaxHeight(),
        ...(container ? [background(container)] : []),
        padding(4, 0, 4, 0),
      ]}
    >
      {icon && <Icon name={icon} size={11} color={content} />}
      <Text style={{ typography: "labelSmall" }} color={content} maxLines={1}>
        {label}
      </Text>
    </Row>
  );
}

/** M3's large badge, 16dp and fully round, cut into segments. */
export function SplitBadge({ segments, accessibilityLabel }: SplitBadgeProps) {
  return (
    <EnsureHost matchContents>
      <Row
        verticalAlignment="center"
        modifiers={[
          height(16),
          clip(Shapes.RoundedCorner(8)),
          ...(accessibilityLabel
            ? [semantics({ contentDescription: accessibilityLabel })]
            : []),
        ]}
      >
        {segments.map((segment) => (
          <Segment key={`${segment.color}-${segment.label}`} {...segment} />
        ))}
      </Row>
    </EnsureHost>
  );
}
