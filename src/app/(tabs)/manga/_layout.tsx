import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { header } from "@/components/layout/header";
import { session$ } from "@/state/session";

export default function Layout() {
  const token = useValue(session$.token);

  return (
    // Must stay inside the tab's screen: SafeAreaListener measures its own
    // native view, so up at the root it would miss the tab bar height.
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <Stack
        screenOptions={{
          header,
          headerBlurEffect: "systemChromeMaterial",
          headerShadowVisible: false,
          headerStyle: { backgroundColor: "transparent" },
          headerLargeStyle: { backgroundColor: "transparent" },
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="index" />
          <Stack.Screen name="[id]" />
        </Stack.Protected>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    </SafeAreaListener>
  );
}
