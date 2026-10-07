import { useMaterialColors } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import type { NativeStackNavigationOptions, Stack, Theme } from "expo-router";
import type { NativeTabsProps } from "expo-router/native-tabs";
import type { ComponentProps } from "react";
import type { RefreshControlProps } from "react-native";
import { header } from "@/components/layout/header";
import { type ThemeColor, useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { useFontFamily, useNavigationFonts } from "../use-font";

export function useThemeM3Colors(name: ThemeColor = "primary") {
  const mode = useValue(theme$.mode);
  const primary = useThemeColor(name);
  return useMaterialColors({ seedColor: primary, colorScheme: mode });
}

export function useNativeTabsTheme(): NativeTabsProps {
  const m3 = useThemeM3Colors();
  const fontFamily = useFontFamily("medium");

  return {
    tintColor: m3.primary,
    backgroundColor: m3.surfaceContainer,
    indicatorColor: m3.secondaryContainer,
    rippleColor: m3.secondaryContainer,
    labelStyle: {
      default: { color: m3.onSurfaceVariant, fontFamily },
      selected: { color: m3.secondary, fontFamily },
    },
    iconColor: {
      default: m3.onSurfaceVariant,
      selected: m3.onSecondaryContainer,
    },
  };
}

export function useNavigationTheme(): Theme {
  const m3 = useThemeM3Colors();
  const fonts = useNavigationFonts();

  return {
    dark: useValue(theme$.mode) === "dark",
    colors: {
      primary: m3.primary,
      background: m3.background,
      card: m3.surface,
      text: m3.onSurface,
      border: m3.outline,
      notification: m3.error,
    },
    fonts,
  };
}

export function useStackTheme(): NativeStackNavigationOptions {
  const m3 = useThemeM3Colors();

  return {
    header,
    headerTintColor: m3.onSurface,
    headerShadowVisible: false,
    headerTransparent: true,
  };
}

export function useStackSearchBarTheme(): ComponentProps<
  typeof Stack.SearchBar
> {
  const m3 = useThemeM3Colors();

  return {
    textColor: m3.onSurface,
    hintTextColor: m3.onSurfaceVariant,
    headerIconColor: m3.onSurface,
  };
}

export function useRefreshControlTheme(): Partial<RefreshControlProps> {
  const m3 = useThemeM3Colors();

  return {
    colors: [m3.primary],
    progressBackgroundColor: m3.surfaceContainerHigh,
  };
}
