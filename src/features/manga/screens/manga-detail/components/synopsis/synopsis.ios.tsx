import { Overlay } from "@expo/ui/swift-ui";
import {
  Animation,
  accessibilityHidden,
  animation,
  background,
  clipped,
  frame,
  lineLimit,
  onGeometryChange,
  opacity,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Feedback } from "@/components/ui/feedback";
import { Typography } from "@/components/ui/typography";
import { useThemeColor } from "@/hooks/use-theme-color";

/** Enough to tell what the book is about, short enough to leave the page scannable. */
const COLLAPSED_LINES = 3;

/**
 * One `Text` clipped by a frame that animates between its collapsed and full
 * heights, with "more" on the last line like the App Store.
 */
export function Synopsis({ text }: { text: string | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const [collapsedHeight, setCollapsedHeight] = useState<number>();
  const [fullHeight, setFullHeight] = useState<number>();
  const pageBackground = useThemeColor("background");

  if (!text) return null;

  return (
    // Outside the button, or it snaps to its new height and centres the text.
    <Column
      modifiers={[
        // Drawer-scale travel, on a curve that leaves the start instead of front-loading it.
        animation(Animation.spring({ duration: 0.3, bounce: 0 }), expanded),
      ]}
    >
      <Feedback onPress={() => setExpanded((e) => !e)}>
        <Overlay alignment="bottomTrailing">
          <Typography
            muted
            modifiers={
              collapsedHeight == null
                ? [
                    lineLimit(COLLAPSED_LINES),
                    onGeometryChange(({ height }) =>
                      setCollapsedHeight(height),
                    ),
                  ]
                : [
                    // Before the frame, so it reads the text's own height.
                    onGeometryChange(({ height }) => setFullHeight(height)),
                    // Collapsed height is measured once, so a width change keeps it.
                    frame({
                      height: expanded ? fullHeight : collapsedHeight,
                      alignment: "topLeading",
                    }),
                    clipped(),
                  ]
            }
          >
            {text}
          </Typography>
          <Overlay.Content>
            <Typography
              className="pl-6 text-inherit"
              modifiers={[
                background(pageBackground),
                opacity(expanded ? 0 : 1),
                accessibilityHidden(true),
              ]}
            >
              more
            </Typography>
          </Overlay.Content>
        </Overlay>
      </Feedback>
    </Column>
  );
}
