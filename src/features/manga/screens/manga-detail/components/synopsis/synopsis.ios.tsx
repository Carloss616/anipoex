import { Button, Overlay, VStack } from "@expo/ui/swift-ui";
import {
  Animation,
  accessibilityHidden,
  animation,
  background,
  buttonStyle,
  clipped,
  fixedSize,
  foregroundStyle,
  frame,
  lineLimit,
  multilineTextAlignment,
  onGeometryChange,
  opacity,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Text } from "@/components/native/swift-ui/text";
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
    <VStack
      alignment="leading"
      modifiers={[
        // Drawer-scale travel, on a curve that leaves the start instead of front-loading it.
        animation(Animation.spring({ duration: 0.3, bounce: 0 }), expanded),
      ]}
    >
      <Button
        onPress={() => setExpanded((e) => !e)}
        modifiers={[buttonStyle("borderless")]}
      >
        <Overlay alignment="bottomTrailing">
          <Text
            modifiers={
              collapsedHeight == null
                ? [
                    foregroundStyle("secondary"),
                    // A button centres its label; the synopsis reads from the leading edge.
                    multilineTextAlignment("leading"),
                    // A tight height truncates mid-word: the text keeps its own.
                    fixedSize({ horizontal: false, vertical: true }),
                    lineLimit(COLLAPSED_LINES),
                    onGeometryChange(({ height }) =>
                      setCollapsedHeight(height),
                    ),
                  ]
                : [
                    foregroundStyle("secondary"),
                    multilineTextAlignment("leading"),
                    fixedSize({ horizontal: false, vertical: true }),
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
          </Text>
          <Overlay.Content>
            {/* No color of its own: it wears the button's tint. */}
            <Text
              modifiers={[
                padding({ leading: 24 }),
                background(pageBackground),
                opacity(expanded ? 0 : 1),
                accessibilityHidden(true),
              ]}
            >
              more
            </Text>
          </Overlay.Content>
        </Overlay>
      </Button>
    </VStack>
  );
}
