import type { MaterialColors } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import type {
  NativeStackNavigationOptions,
  StackSearchBarProps,
  Theme,
} from "expo-router";
import type { NativeTabsProps } from "expo-router/unstable-native-tabs";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import type { RefreshControlProps } from "react-native";
import { Platform } from "react-native";
import type { Route, TabBarProps, TabDescriptor } from "react-native-tab-view";
import { useResolveClassNames } from "uniwind";
import { header } from "@/components/layout/header";
import { type ThemeColor, useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { dp } from "@/utils/utils";
import { useFontFamily, useNavigationFonts } from "../use-font";

export function useThemeM3Colors(_name?: ThemeColor) {
  return null as MaterialColors | null;
}

export function useNativeTabsTheme(): NativeTabsProps {
  // PanelUI's `accent` is the tinted surface a selected item sits on, not the
  // brand — that is `primary`.
  const [accentForeground, accent, primary, surface, mutedForeground] =
    useThemeColor([
      "accent-foreground",
      "accent",
      "primary",
      "surface",
      "muted-foreground",
    ]);
  const fontFamily = useFontFamily("medium");

  return {
    tintColor: primary,
    backgroundColor: surface,
    indicatorColor: accent,
    rippleColor: accent,
    labelStyle: {
      default: { color: mutedForeground, fontFamily },
      selected: { color: accentForeground, fontFamily },
    },
    iconColor: { default: mutedForeground, selected: accentForeground },
  };
}

export function useNavigationTheme(): Theme {
  const mode = useValue(theme$.mode);
  const [primary, background, card, foreground, border, destructive] =
    useThemeColor([
      "primary",
      "background",
      "card",
      "foreground",
      "border",
      "destructive",
    ]);
  const fonts = useNavigationFonts();

  return {
    dark: mode === "dark",
    colors: {
      primary,
      background,
      card,
      text: foreground,
      border,
      notification: destructive,
    },
    fonts,
  };
}

export function useStackTheme(): NativeStackNavigationOptions {
  const foreground = useThemeColor("foreground");

  return {
    header,
    headerTintColor: foreground,
    headerBlurEffect: "systemChromeMaterial",
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "transparent" },
    headerLargeStyle: { backgroundColor: "transparent" },
    headerBackButtonDisplayMode: "minimal",
  };
}

export function useStackSearchBarTheme(): StackSearchBarProps {
  return {};
}

export function useRefreshControlTheme(): Partial<RefreshControlProps> {
  const [primary, card] = useThemeColor(["primary", "card"]);

  return {
    tintColor: primary,
    colors: [primary],
    progressBackgroundColor: card,
  };
}

export function useTabViewTheme(): {
  commonOptions: Pick<TabDescriptor<Route>, "labelStyle">;
  tabBar: Pick<
    TabBarProps<Route>,
    | "scrollEnabled"
    | "activeColor"
    | "inactiveColor"
    | "pressColor"
    | "pressOpacity"
    | "style"
    | "tabStyle"
    | "indicatorStyle"
    | "contentContainerStyle"
  >;
} {
  const [primary, mutedForeground] = useThemeColor([
    "primary",
    "muted-foreground",
  ]);
  const styles = useResolveClassNames("bg-transparent border-border");
  const tabStyles = useResolveClassNames("px-4");
  const labelStyles = useResolveClassNames("font-medium text-sm normal-case");

  const { current, width } = useBreakpoint();
  const tabWidth = Math.min(Math.max(width * 0.4, 140), 180);
  // The trailing breakpoint is a cache key, not a class: uniwind only re-resolves
  // when the string changes, and `gx` grows with the web breakpoints.
  const gutter = useResolveClassNames(
    `gutters px-safe-offset-gx${Platform.OS === "web" ? ` ${current}` : ""}`,
  );

  return {
    commonOptions: {
      labelStyle: labelStyles,
    },
    tabBar: {
      scrollEnabled: true,
      activeColor: primary,
      inactiveColor: mutedForeground,
      pressColor: "transparent",
      pressOpacity: 0.5,
      style: [
        styles,
        {
          borderBottomWidth: 1,
          shadowOpacity: 0,
        },
      ],
      tabStyle: [tabStyles, { width: tabWidth }],
      indicatorStyle: { backgroundColor: primary },
      contentContainerStyle: {
        // TabBarIndicator only adds it to the position when it is a number.
        // On web it arrives as <N>px, so it must be converted to <N> (without "px").
        paddingLeft: dp(gutter.paddingLeft),
        paddingRight: dp(gutter.paddingRight),
      },
    },
  };
}
