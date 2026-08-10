import type {
  NativeStackNavigationOptions,
  StackSearchBarProps,
  StackToolbarProps,
  Theme,
} from "expo-router";
import type { NativeTabsProps } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native/hooks";
import type { RefreshControlProps } from "react-native";
import { useUniwind } from "uniwind";
import { header } from "@/components/layout/header";
import { useFontFamily, useNavigationFonts } from "../use-font";

export function useNativeTabsTheme(): NativeTabsProps {
  const [accentSoftForeground, accentSoft, accent, backgroundSecondary, muted] =
    useThemeColor([
      "accent-soft-foreground",
      "accent-soft",
      "accent",
      "background-secondary",
      "muted",
    ]);
  const fontFamily = useFontFamily("medium");

  return {
    tintColor: accent,
    backgroundColor: backgroundSecondary,
    indicatorColor: accentSoft,
    rippleColor: accentSoft,
    labelStyle: {
      default: { color: muted, fontFamily },
      selected: { color: accentSoftForeground, fontFamily },
    },
    iconColor: { default: muted, selected: accentSoftForeground },
  };
}

export function useNavigationTheme(): Theme {
  const { theme } = useUniwind();
  const [accent, background, surface, foreground, border, danger] =
    useThemeColor([
      "accent",
      "background",
      "surface",
      "foreground",
      "border",
      "danger",
    ]);
  const fonts = useNavigationFonts();

  return {
    dark: theme === "dark",
    colors: {
      primary: accent,
      background,
      card: surface,
      text: foreground,
      border,
      notification: danger,
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
  const [accent, surface] = useThemeColor(["accent", "surface"]);

  return {
    tintColor: accent,
    colors: [accent],
    progressBackgroundColor: surface,
  };
}
