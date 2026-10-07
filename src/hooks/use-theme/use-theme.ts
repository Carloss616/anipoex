import type { MaterialColors } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import type { NativeStackNavigationOptions, Stack, Theme } from "expo-router";
import type { NativeTabsProps } from "expo-router/native-tabs";
import type { ComponentProps } from "react";
import type { RefreshControlProps } from "react-native";
import { header } from "@/components/layout/header";
import { type ThemeColor, useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
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
    headerBlurEffect: isLiquidGlassAvailable()
      ? undefined
      : "systemChromeMaterial",
    headerShadowVisible: false,
    headerTransparent: true,
    headerStyle: { backgroundColor: "transparent" },
    headerLargeStyle: { backgroundColor: "transparent" },
    headerBackButtonDisplayMode: "minimal",
  };
}

export function useStackSearchBarTheme(): ComponentProps<
  typeof Stack.SearchBar
> {
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
