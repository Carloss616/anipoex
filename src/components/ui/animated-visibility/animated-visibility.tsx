import { cn } from "panelui-native/utils/cn";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

// The `duration-300` below.
const DURATION_MS = 300;

export interface AnimatedVisibilityProps {
  visible: boolean;
  /**
   * Animates a new height while open; off when the content animates its own.
   * @platform web
   */
  animateResize?: boolean;
  children?: ReactNode;
}

// CSS can't transition `height: auto`: the content is measured instead.
export function AnimatedVisibility({
  visible,
  animateResize = true,
  children,
}: AnimatedVisibilityProps) {
  const last = useRef(children);
  if (visible) last.current = children;
  const [height, setHeight] = useState<number>();
  // Open and still: unclipped, so a focus ring or shadow shows whole.
  const [settled, setSettled] = useState(false);

  // A new height restarts the clip only when that height animates too.
  const settleOn = animateResize ? height : height !== undefined;
  useEffect(() => {
    setSettled(false);
    if (!visible || settleOn === undefined || settleOn === false) return;
    const timer = setTimeout(() => setSettled(true), DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible, settleOn]);

  return (
    <View
      // `overflow-hidden` only hides it from the eye, not from a screen reader.
      aria-hidden={!visible}
      className={cn(
        "self-stretch",
        (animateResize || !settled) &&
          "ease-sheet transition-[height,opacity] duration-300",
        // Closing clips at once; `settled` only catches up after this render.
        (!visible || !settled) && "overflow-hidden",
      )}
      // Two of these animate at once; the fade blends the overlap.
      style={{ height: visible ? height : 0, opacity: visible ? 1 : 0 }}
    >
      <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {last.current}
      </View>
    </View>
  );
}
