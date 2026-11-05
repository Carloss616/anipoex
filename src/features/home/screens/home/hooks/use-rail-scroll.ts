import { useRef } from "react";
import type { ScrollView } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

/** A horizontal scroller and a step of most of its width, for the arrows. */
export function useRailScroll() {
  const ref = useRef<ScrollView>(null);
  const reduced = useReducedMotion();

  const scroll = (direction: 1 | -1) => {
    const node = ref.current?.getScrollableNode() as HTMLElement | undefined;
    node?.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return { ref, scroll };
}
