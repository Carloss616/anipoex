import type { ScrollView } from "react-native";
import type { AnimatedRef } from "react-native-reanimated";

/** Reanimated's web `scrollTo` hands the DOM React Native's `{ x, y }`, which it ignores. */
export function scrollList(ref: AnimatedRef<ScrollView>, y: number) {
  "worklet";
  const node = ref() as unknown as HTMLElement | null;
  if (node) node.scrollTop = y;
}
