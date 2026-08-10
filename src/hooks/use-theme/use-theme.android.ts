import { useMaterialColors } from "@expo/ui/jetpack-compose";
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
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });
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
  const { theme } = useUniwind();
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent, colorScheme: theme });
  const fonts = useNavigationFonts();

  return {
    dark: theme === "dark",
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
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });

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
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });

  return {
    textColor: m3.onSurface,
    hintTextColor: m3.onSurfaceVariant,
    headerIconColor: m3.onSurface,
  };
}

export function useStackToolbarTheme(): StackToolbarProps {
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });

  return {
    backgroundColor: m3.surfaceContainerLow,
  };
}

export function useRefreshControlTheme(): Partial<RefreshControlProps> {
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });

  return {
    colors: [m3.primary],
    progressBackgroundColor: m3.surfaceContainerHigh,
  };
}
