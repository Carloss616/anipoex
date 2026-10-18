import { Box } from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  background,
  clickable,
  padding,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";

/** Enough to tell what the book is about, short enough to leave the page scannable. */
const COLLAPSED_LINES = 3;

/**
 * One `Text` whose `maxLines` changes, with `animateContentSize` springing the
 * node to the new height, and "more" on the last line as on iOS and web.
 */
export function Synopsis({ text }: { text: string | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const m3 = useThemeM3Colors();

  if (!text) return null;

  return (
    <Box
      contentAlignment="bottomEnd"
      modifiers={[clickable(() => setExpanded((e) => !e))]}
    >
      <Text
        color={m3.onSurfaceVariant}
        maxLines={expanded ? undefined : COLLAPSED_LINES}
        overflow={expanded ? undefined : "ellipsis"}
        modifiers={[animateContentSize()]}
      >
        {text}
      </Text>
      {!expanded && (
        <Text
          style={{ fontWeight: "500" }}
          color={m3.primary}
          // The background first, so it reaches under the padding too.
          modifiers={[background(m3.surface), padding(24, 0, 0, 0)]}
        >
          more
        </Text>
      )}
    </Box>
  );
}
