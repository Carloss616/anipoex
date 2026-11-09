import { Stack } from "expo-router";
import { header } from "@/components/layout/header";
import { useStackTheme } from "@/hooks/use-theme";

// A link straight to a settings page still has Settings under it.
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const stackTheme = useStackTheme();

  // Not in useStackTheme: `header` imports Icon and Host, which import it.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="layout" />
      <Stack.Screen name="languages" />
    </Stack>
  );
}
