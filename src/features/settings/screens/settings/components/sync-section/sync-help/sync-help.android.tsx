import {
  IconButton,
  TooltipBox,
  type TooltipBoxRef,
} from "@expo/ui/jetpack-compose";
import { useRef } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, Icons } from "@/components/ui/icon";
import { HELP_HOW, HELP_TITLE } from "../constants";
import type { SyncHelpProps } from "./sync-help";

/** M3's rich tooltip from an info button: a tap opens it, it stays until dismissed. */
export function SyncHelp({ moments }: SyncHelpProps) {
  const tooltip = useRef<TooltipBoxRef>(null);

  return (
    <TooltipBox ref={tooltip} isPersistent>
      <TooltipBox.RichTooltip>
        <TooltipBox.RichTooltip.Title>
          <Text style={{ typography: "titleSmall" }}>{HELP_TITLE}</Text>
        </TooltipBox.RichTooltip.Title>
        <TooltipBox.RichTooltip.Text>
          <Text style={{ typography: "bodyMedium" }}>
            {[...moments.map((moment) => `• ${moment}`), "", HELP_HOW].join(
              "\n",
            )}
          </Text>
        </TooltipBox.RichTooltip.Text>
      </TooltipBox.RichTooltip>
      <IconButton onClick={() => void tooltip.current?.show()}>
        <Icon
          name={Icons.info}
          accessibilityLabel={HELP_TITLE}
          color="inherit"
        />
      </IconButton>
    </TooltipBox>
  );
}
