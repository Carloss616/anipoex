import { ApolloProvider } from "@apollo/client/react";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native/provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { ToastHost, toastConfig } from "@/components/ui/toast";
import { client } from "@/graphql/client";
import { useCacheRestored } from "@/graphql/use-cache-restored";
import "@/global.css";
import "@/utils/focus-modality";
import { Stack } from "expo-router/stack";
import { StatusBar } from "expo-status-bar";
import { useNavigationTheme } from "@/hooks/use-theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const cacheRestored = useCacheRestored();
  const theme = useNavigationTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded || !cacheRestored) return null;

  return (
    <GestureHandlerRootView className="web:bg-background">
      <ApolloProvider client={client}>
        <HeroUINativeProvider config={{ toast: toastConfig }}>
          <ThemeProvider value={theme}>
            <AnimatedSplashOverlay />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen
                name="sign-in"
                options={{ presentation: "modal" }}
              />
            </Stack>
            <ToastHost />
            <StatusBar style={theme.dark ? "light" : "dark"} />
          </ThemeProvider>
        </HeroUINativeProvider>
      </ApolloProvider>
    </GestureHandlerRootView>
  );
}
