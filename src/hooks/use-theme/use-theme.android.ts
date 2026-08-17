import { useMaterialColors } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import type {
  NativeStackNavigationOptions,
  StackSearchBarProps,
  StackToolbarProps,
  Theme,
} from "expo-router";
import type { NativeTabsProps } from "expo-router/unstable-native-tabs";
import type { RefreshControlProps } from "react-native";
import { header } from "@/components/layout/header";
import { useThemeColor } from "@/hooks/use-theme-color";
import { theme$ } from "@/state/theme";
import { useFontFamily, useNavigationFonts } from "../use-font";

export function useNativeTabsTheme(): NativeTabsProps {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });
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
  const mode = useValue(theme$.mode);
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary, colorScheme: mode });
  const fonts = useNavigationFonts();

  return {
    dark: mode === "dark",
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
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });

  return {
    header,
    headerTintColor: m3.onSurface,
    headerBlurEffect: "systemChromeMaterial",
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "transparent" },
    headerLargeStyle: { backgroundColor: "transparent" },
    headerBackButtonDisplayMode: "minimal",
  };
}

export function useStackSearchBarTheme(): StackSearchBarProps {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });

  return {
    textColor: m3.onSurface,
    hintTextColor: m3.onSurfaceVariant,
    headerIconColor: m3.onSurface,
  };
}

export function useStackToolbarTheme(): StackToolbarProps {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });

  return {
    backgroundColor: m3.surfaceContainerLow,
  };
}

export function useRefreshControlTheme(): Partial<RefreshControlProps> {
  const primary = useThemeColor("primary");
  const m3 = useMaterialColors({ seedColor: primary });

  return {
    colors: [m3.primary],
    progressBackgroundColor: m3.surfaceContainerHigh,
  };
}
