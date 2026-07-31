import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useThemeColor } from "heroui-native/hooks";
import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUniwind } from "uniwind";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { Tabs } from "@/components/layout/tabs";
import "@/global.css";
import "@/utils/focus-modality";

SplashScreen.preventAutoHideAsync();

// mobile only
function useNavigationTheme() {
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
  const base = theme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      primary: accent,
      background,
      card: surface,
      text: foreground,
      border,
      notification: danger,
    },
  };
}

export default function RootLayout() {
  const theme = useNavigationTheme();
  return (
    <GestureHandlerRootView className="web:bg-background">
      <HeroUINativeProvider>
        <ThemeProvider value={theme}>
          <AnimatedSplashOverlay />
          <Tabs />
        </ThemeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
