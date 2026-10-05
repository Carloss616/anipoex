import { Stack } from "expo-router";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { useStackTheme } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();

  return (
    // Must stay inside the tab's screen: SafeAreaListener measures its own
    // native view, so up at the root it would miss the tab bar height.
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <Stack screenOptions={stackTheme}>
        <Stack.Screen name="index" />
        <Stack.Screen name="[id]" />
      </Stack>
    </SafeAreaListener>
  );
}
