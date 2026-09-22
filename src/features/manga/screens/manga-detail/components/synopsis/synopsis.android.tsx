import { Box } from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  background,
  clickable,
} from "@expo/ui/jetpack-compose/modifiers";
import { useState } from "react";
import { Typography } from "@/components/ui/typography";
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
      <Typography
        muted
        numberOfLines={expanded ? undefined : COLLAPSED_LINES}
        modifiers={[animateContentSize()]}
      >
        {text}
      </Typography>
      {!expanded && (
        <Typography
          weight="medium"
          className="pl-6"
          style={{ color: m3.primary }}
          modifiers={[background(m3.surface)]}
        >
          more
        </Typography>
      )}
    </Box>
  );
}
