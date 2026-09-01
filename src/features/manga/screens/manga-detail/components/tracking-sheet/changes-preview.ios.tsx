import { Animation, animation } from "@expo/ui/swift-ui/modifiers";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Typography } from "@/components/ui/typography";
import type { ChangesPreviewProps } from "./changes-preview";

/**
 * SwiftUI animates a change only from a view that outlives it, so the column
 * stays mounted and the lines come and go inside it.
 */
export function ChangesPreview({ changes }: ChangesPreviewProps) {
  const visible = changes.length > 0;

  return (
    <Column
      className={cn("gap-1 px-4", visible && "pb-4")}
      modifiers={[animation(Animation.easeInOut({ duration: 0.2 }), visible)]}
    >
      {changes.map((line) => (
        <Typography key={line} type="small" muted>
          {line}
        </Typography>
      ))}
    </Column>
  );
}
