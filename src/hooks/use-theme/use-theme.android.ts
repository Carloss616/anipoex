import { useMaterialColors } from "@expo/ui/jetpack-compose";
import { useValue } from "@legendapp/state/react";
import type {
  NativeStackNavigationOptions,
  StackSearchBarProps,
  Theme,
} from "expo-router";
import type { NativeTabsProps } from "expo-router/unstable-native-tabs";
import { type RefreshControlProps, useWindowDimensions } from "react-native";
import type { Route, TabBarProps, TabDescriptor } from "react-native-tab-view";
import { useResolveClassNames } from "uniwind";
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
    headerBlurEffect: "systemChromeMaterial",
    headerShadowVisible: false,
    headerStyle: { backgroundColor: "transparent" },
    headerLargeStyle: { backgroundColor: "transparent" },
    headerBackButtonDisplayMode: "minimal",
  };
}

export function useStackSearchBarTheme(): StackSearchBarProps {
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

export function useTabViewTheme(): {
  commonOptions: Pick<TabDescriptor<Route>, "labelStyle">;
  tabBar: Pick<
    TabBarProps<Route>,
    | "scrollEnabled"
    | "activeColor"
    | "inactiveColor"
    | "pressColor"
    | "style"
    | "tabStyle"
    | "indicatorStyle"
    | "contentContainerStyle"
  >;
} {
  const m3 = useThemeM3Colors();
  const { width } = useWindowDimensions();
  const tabWidth = Math.min(Math.max(width * 0.4, 140), 180);
  const tabStyles = useResolveClassNames("px-4");
  const labelStyles = useResolveClassNames("font-medium text-sm normal-case");
  const indicatorStyles = useResolveClassNames("h-0.75 rounded-t-[3px]");
  const contentStyles = useResolveClassNames("gutters px-safe-offset-gx");

  return {
    commonOptions: {
      labelStyle: labelStyles,
    },
    tabBar: {
      scrollEnabled: true,
      activeColor: m3.primary,
      inactiveColor: m3.onSurfaceVariant,
      pressColor: m3.secondaryContainer,
      style: {
        backgroundColor: m3.surface,
        borderBottomWidth: 1,
        borderBottomColor: m3.outlineVariant,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabStyle: [tabStyles, { width: tabWidth }],
      indicatorStyle: [indicatorStyles, { backgroundColor: m3.primary }],
      contentContainerStyle: contentStyles,
    },
  };
}
