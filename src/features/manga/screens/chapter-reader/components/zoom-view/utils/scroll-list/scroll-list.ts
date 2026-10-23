import type { ScrollView } from "react-native";
import { type AnimatedRef, scrollTo } from "react-native-reanimated";

/** Scrolls the list from the UI thread, in the same frame as the zoom's transform. */
export function scrollList(ref: AnimatedRef<ScrollView>, y: number) {
  "worklet";
  scrollTo(ref, 0, y, false);
}
