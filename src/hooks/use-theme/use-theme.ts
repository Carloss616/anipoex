import { useValue } from "@legendapp/state/react";
import type {
  NativeStackNavigationOptions,
  StackSearchBarProps,
  StackToolbarProps,
  Theme,
} from "expo-router";
import type { NativeTabsProps } from "expo-router/unstable-native-tabs";
import { type RefreshControlProps, StyleSheet } from "react-native";
import type { Route, TabBarProps, TabDescriptor } from "react-native-tab-view";
import { useResolveClassNames } from "uniwind";
import { header } from "@/components/layout/header";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { useFontFamily, useNavigationFonts } from "../use-font";

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

export function useStackToolbarTheme(): StackToolbarProps {
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
    // | "contentContainerStyle"
    // | "indicatorContainerStyle"
  >;
} {
  const [primary, mutedForeground] = useThemeColor([
    "primary",
    "muted-foreground",
  ]);
  const styles = useResolveClassNames("bg-transparent border-border");
  const tabStyles = useResolveClassNames("w-auto px-4");
  const labelStyles = useResolveClassNames("font-medium text-sm normal-case");
  

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
          borderBottomWidth: StyleSheet.hairlineWidth,
          shadowOpacity: 0,
        },
      ],
      tabStyle: tabStyles,
      indicatorStyle: { backgroundColor: primary },
      // contentContainerStyle: pxStyles,
      // indicatorContainerStyle: pxStyles,
    },
  };
}
