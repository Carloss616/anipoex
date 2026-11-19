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
      <Stack.Screen name="account" />
      <Stack.Screen name="appearance" />
      <Stack.Screen name="sync" />
      <Stack.Screen name="sources" />
      <Stack.Screen name="downloads" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="layout" />
      <Stack.Screen name="languages" />
    </Stack>
  );
}
