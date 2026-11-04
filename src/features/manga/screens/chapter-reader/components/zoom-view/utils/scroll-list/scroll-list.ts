import type { ScrollView } from "react-native";
import { type AnimatedRef, scrollTo } from "react-native-reanimated";

/** Scrolls the list on the UI thread, in the zoom transform's frame. */
export function scrollList(ref: AnimatedRef<ScrollView>, y: number) {
  "worklet";
  scrollTo(ref, 0, y, false);
}
