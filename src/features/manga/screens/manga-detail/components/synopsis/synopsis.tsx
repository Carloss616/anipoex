import { useState } from "react";
import { View } from "react-native";
import { Feedback } from "@/components/ui/feedback";
import { Typography } from "@/components/ui/typography";

/** Enough to tell what the book is about, short enough to leave the page scannable. */
const COLLAPSED_LINES = 3;

/**
 * One text, clipped to its first lines by a box whose height transitions. CSS
 * can't transition to `height: auto`, so both heights are measured. "more" sits
 * on the last line, as on iOS.
 */
export function Synopsis({ text }: { text: string | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number>();
  const [fullHeight, setFullHeight] = useState<number>();

  if (!text) return null;

  return (
    <Feedback onPress={() => setExpanded((e) => !e)}>
      <View>
        <View
          className="overflow-hidden transition-[height] duration-300 ease-sheet motion-reduce:transition-none"
          style={{
            height:
              collapsedHeight && (expanded ? fullHeight : collapsedHeight),
          }}
        >
          {/* First layout (clamped) gives the collapsed height, the next the full one. */}
          <View
            onLayout={({ nativeEvent: { layout } }) =>
              collapsedHeight == null
                ? setCollapsedHeight(layout.height)
                : setFullHeight(layout.height)
            }
          >
            <Typography
              muted
              numberOfLines={
                collapsedHeight == null ? COLLAPSED_LINES : undefined
              }
            >
              {text}
            </Typography>
          </View>
        </View>
        <Typography
          aria-hidden
          weight="medium"
          className="absolute right-0 bottom-0 bg-background pl-6 text-primary transition-opacity duration-300"
          style={{ opacity: expanded ? 0 : 1 }}
        >
          more
        </Typography>
      </View>
    </Feedback>
  );
}
