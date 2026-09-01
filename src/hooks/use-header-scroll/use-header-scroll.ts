import { useNavigation } from "expo-router";
import { useRef } from "react";
import { Platform, type ScrollViewProps } from "react-native";
import { LARGE_TITLE_HEIGHT } from "@/components/layout/header/constants";
import { useThemeM3Colors } from "@/hooks/use-theme";
import { collapses } from "./collapses";

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

/**
 * `headerShadowVisible` carries that everywhere — Android raises the app bar by
 * 4dp, and the web header blurs and drops the large title back to the plain one,
 * which is what iOS does on its own (`use-header-scroll.ios`).
 */
export function useHeaderScroll(): HeaderScrollProps {
  const navigation = useNavigation();
  const m3 = useThemeM3Colors(); // android only
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
      navigation.setOptions({
        headerShadowVisible: Platform.OS === "web" ? next : false,
        ...(m3 && {
          headerStyle: {
            backgroundColor: next ? m3.surfaceContainer : "transparent",
          },
        }),
      });
    },
  };
}
