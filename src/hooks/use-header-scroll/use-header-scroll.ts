import { type NativeStackNavigationOptions, useNavigation } from "expo-router";
import { useRef } from "react";
import { Platform, type ScrollViewProps } from "react-native";
import { LARGE_TITLE_HEIGHT } from "@/components/layout/header/constants";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { collapses } from "./utils";

/** What collapsing gives back to the scroller. Material's app bar never resizes. */
const GIVES_BACK = Platform.OS === "web" ? LARGE_TITLE_HEIGHT : 0;

/** Spread onto the screen's scroller — the one the header should react to. */
export type HeaderScrollProps = Pick<
  ScrollViewProps,
  | "contentContainerStyle"
  | "onScroll"
  | "scrollEventThrottle"
  | "contentInsetAdjustmentBehavior"
>;

export function useHeaderScroll(): HeaderScrollProps {
  const setScrolled = useSetHeaderScrolled();
  const scrolled = useRef(false);

  return {
    scrollEventThrottle: 16,
    onScroll: ({ nativeEvent }) => {
      const next = collapses(nativeEvent, {
        collapsed: scrolled.current,
        givesBack: GIVES_BACK,
      });
      if (next === scrolled.current) return;

      scrolled.current = next;
      setScrolled(next);
    },
  };
}

/** The header's scrolled state, for scrollers with no `onScroll` (Compose lists). */
export function useSetHeaderScrolled() {
  const navigation = useNavigation();
  const m3 = useThemeM3Colors(); // android only

  return (scrolled: boolean) =>
    navigation.setOptions({
      headerShadowVisible: Platform.OS === "web" ? scrolled : false,
      ...(m3 && {
        headerStyle: {
          backgroundColor: scrolled ? m3.surfaceContainer : "transparent",
        },
      }),
    } satisfies NativeStackNavigationOptions);
}
