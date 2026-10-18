import { type NativeStackNavigationProp, useNavigation } from "expo-router";
import { HeaderHeightContext } from "expo-router/react-navigation";
import { use, useEffect, useRef, useState } from "react";

/**
 * The header height at rest, fixed once the push ends; scrolling and pulling
 * don't change it.
 *
 * Call it from the screen and pass the value down: a component mounted after
 * the push never gets it.
 */
export function useMaxHeaderHeight() {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<Record<string, object | undefined>>
    >();
  const max = useRef(0);
  const [settled, setSettled] = useState(false);

  useEffect(
    () => navigation.addListener("transitionEnd", () => setSettled(true)),
    [navigation],
  );

  // Reading the context re-renders on every frame of a pull, which cancels
  // the refresh, so it's only read until the push ends.
  if (!settled) {
    max.current = Math.max(max.current, use(HeaderHeightContext) ?? 0);
  }

  return max.current;
}
