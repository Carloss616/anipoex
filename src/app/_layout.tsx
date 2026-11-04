import "@/global.css";

import { ApolloProvider } from "@apollo/client/react";
import { useValue } from "@legendapp/state/react";
import { useFonts } from "expo-font";
import { ThemeProvider } from "expo-router";
import { Stack } from "expo-router/stack";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ToastHost, ToastProvider } from "@/components/ui/toast";
import { useRefreshViewer } from "@/features/auth/hooks/use-refresh-viewer";
import { client } from "@/graphql/client";
import { useCacheRestored } from "@/graphql/use-cache-restored";
import { useNavigationTheme } from "@/hooks/use-theme";
import { session$ } from "@/state/session";

SplashScreen.preventAutoHideAsync();
// Android always fades it out; iOS only when asked.
SplashScreen.setOptions({ fade: true });

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

  const ready = fontsLoaded && cacheRestored;

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ToastProvider>
        <ApolloProvider client={client}>
          <ThemeProvider value={theme}>
            <Layout />
            <ToastHost />
            <StatusBar style={theme.dark ? "light" : "dark"} />
          </ThemeProvider>
        </ApolloProvider>
      </ToastProvider>
    </GestureHandlerRootView>
  );
}

function Layout() {
  const token = useValue(session$.token);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!token} redirectTo="/sign-in">
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!token} redirectTo="/">
        <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
      </Stack.Protected>
    </Stack>
  );
}
