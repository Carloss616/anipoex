import { type Href, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";

type StackState = {
  routes: { name: string; params?: object }[];
  index: number;
};

/**
 * A link straight to a sheet (or a web reload) has nothing under it: the
 * sheet replaces itself with `base` and pushes itself back. Not the stack's
 * `unstable_settings.anchor`, which on iOS made its later pushes (the reader)
 * open as sheets, and takes only a static first screen.
 */
export function useSheetOver(
  isOver: (state: StackState) => boolean,
  base: Href,
  self: Href,
) {
  const navigation = useNavigation();
  const router = useRouter();
  useEffect(() => {
    const state = navigation.getState();
    if (!state || isOver(state)) return;
    router.replace(base);
    router.push(self);
  }, [navigation, router, isOver, base, self]);
}
