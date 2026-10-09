import { type NativeStackNavigationProp, useNavigation } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect, useRef } from "react";

/**
 * The header at its tallest at rest. `useHeaderHeight` shrinks with the
 * collapsing title, and padding that followed it would drag the content up by
 * that same row. It also grows while a pull stretches iOS's large title, so the
 * max stops at the end of the push: past it, following the stretch relaid the
 * hero out mid-pull, which cancelled the refresh.
 */
export function useMaxHeaderHeight() {
  const height = useHeaderHeight();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<Record<string, object | undefined>>
    >();
  const max = useRef(0);
  const settled = useRef(false);

  useEffect(
    () =>
      navigation.addListener("transitionEnd", () => {
        settled.current = true;
      }),
    [navigation],
  );

  if (!settled.current) max.current = Math.max(max.current, height);

  return max.current;
}
