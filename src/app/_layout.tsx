import "@/global.css";
import "@/utils/focus-modality";

import { ApolloProvider } from "@apollo/client/react";
import { useFonts } from "expo-font";
import { ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { PanelUIProvider } from "panelui-native";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ToastHost } from "@/components/ui/toast";
import { useRefreshViewer } from "@/features/auth/hooks/use-refresh-viewer";
import { client } from "@/graphql/client";
import { useCacheRestored } from "@/graphql/use-cache-restored";
import { useNavigationTheme } from "@/hooks/use-theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const cacheRestored = useCacheRestored();
  const theme = useNavigationTheme();
  const [fontsLoaded] = useFonts({
    "MapleMono-Regular": require("@/assets/fonts/MapleMono/MapleMono-Regular.ttf"),
    "MapleMono-Medium": require("@/assets/fonts/MapleMono/MapleMono-Medium.ttf"),
    "MapleMono-SemiBold": require("@/assets/fonts/MapleMono/MapleMono-SemiBold.ttf"),
    "MapleMono-Bold": require("@/assets/fonts/MapleMono/MapleMono-Bold.ttf"),
  });

  useRefreshViewer();

  if (!fontsLoaded || !cacheRestored) return null;

  return (
    <PanelUIProvider background={false} className="web:bg-background">
      <ApolloProvider client={client}>
        <ThemeProvider value={theme}>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
          </Stack>
          <ToastHost />
          <StatusBar style={theme.dark ? "light" : "dark"} />
        </ThemeProvider>
      </ApolloProvider>
    </PanelUIProvider>
  );
}
