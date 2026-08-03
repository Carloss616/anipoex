import { Stack } from "expo-router";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { header } from "@/components/layout/header";

export default function Layout() {
  return (
    // Must stay inside the tab's screen: SafeAreaListener measures its own
    // native view, so up at the root it would miss the tab bar height.
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <Stack
        initialRouteName="index"
        screenOptions={{
          header,
          headerBlurEffect: "systemChromeMaterial",
          headerShadowVisible: false,
          headerLargeStyle: { backgroundColor: "transparent" },
          headerBackButtonDisplayMode: "minimal",
        }}
      />
    </SafeAreaListener>
  );
}
