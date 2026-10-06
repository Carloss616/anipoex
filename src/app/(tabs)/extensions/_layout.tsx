import { Stack } from "expo-router";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { useStackTheme } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();

  return (
    // Inside the tab's screen so the inset includes the tab bar (see manga/_layout).
    <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
      <Stack screenOptions={stackTheme} />
    </SafeAreaListener>
  );
}
