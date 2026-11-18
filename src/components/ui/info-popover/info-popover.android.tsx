import {
  IconButton,
  TooltipBox,
  type TooltipBoxRef,
} from "@expo/ui/jetpack-compose";
import { useRef } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import type { InfoPopoverProps } from "./info-popover";

/** M3's rich tooltip from an info button: a tap opens it, it stays until dismissed. */
export function InfoPopover({
  label,
  title,
  text,
  items,
  note,
}: InfoPopoverProps) {
  const tooltip = useRef<TooltipBoxRef>(null);

  return (
    <TooltipBox ref={tooltip} isPersistent>
      <TooltipBox.RichTooltip>
        {title && (
          <TooltipBox.RichTooltip.Title>
            <Text style={{ typography: "titleSmall" }}>{title}</Text>
          </TooltipBox.RichTooltip.Title>
        )}
        <TooltipBox.RichTooltip.Text>
          <Text style={{ typography: "bodyMedium" }}>
            {[text, items?.map((item) => `• ${item}`).join("\n"), note]
              .filter(Boolean)
              .join("\n\n")}
          </Text>
        </TooltipBox.RichTooltip.Text>
      </TooltipBox.RichTooltip>
      <IconButton onClick={() => void tooltip.current?.show()}>
        <Icon name={Icons.info} accessibilityLabel={label} color="inherit" />
      </IconButton>
    </TooltipBox>
  );
}
