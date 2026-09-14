import type { ReactNode } from "react";
import { useRef, useState } from "react";
import { View } from "react-native";

export interface AnimatedVisibilityProps {
  /** Whether the content is shown. Changing it opens or closes the height. */
  visible: boolean;
  children?: ReactNode;
}

/**
 * Opens and closes its content by height, after Compose's `AnimatedVisibility`,
 * which is what backs this on Android. CSS can't transition `height: auto`, so
 * the web measures the content and animates to the height it reports.
 */
export function AnimatedVisibility({
  visible,
  children,
}: AnimatedVisibilityProps) {
  const last = useRef(children);
  if (visible) last.current = children;
  const [height, setHeight] = useState<number>();

  return (
    <View
      // `overflow-hidden` only hides it from the eye — the content stays in the
      // DOM, and a screen reader would still read what is closed.
      aria-hidden={!visible}
      className="self-stretch overflow-hidden transition-[height] duration-300 ease-out"
      style={{ height: visible ? height : 0 }}
    >
      <View onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {last.current}
      </View>
    </View>
  );
}
