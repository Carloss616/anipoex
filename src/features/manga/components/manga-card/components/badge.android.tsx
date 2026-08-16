import { Card } from "panelui-native/components/card";
import { cn } from "panelui-native/utils/cn";
import { View } from "react-native";
import type { BadgeProps } from "@/components/ui/badge";
import { useColors } from "@/components/ui/badge/badge.android";

/** Redraws the shared Badge in plain RN Yoga: its Android one mounts a `<Host>`, one `ComposeView` per row inside LegendList. */
export function Badge({
  children,
  color = "secondary",
  testID,
  style,
  className,
}: BadgeProps) {
  const { container, content } = useColors(color);
  const dot = children == null;

  return (
    <View
      style={[{ backgroundColor: container }, style]}
      className={cn(
        "items-center justify-center rounded-full",
        dot ? "size-2" : "min-w-5 px-1.5 py-0.5",
        className,
      )}
      testID={testID}
    >
      {/* Not Typography: it resolves to the Android one, which brings the `<Host>` back. */}
      <Card.Description
        style={{ color: content }}
        className="font-medium text-xs leading-[normal]"
      >
        {children}
      </Card.Description>
    </View>
  );
}
