import { Stack } from "expo-router";
import { header } from "@/components/layout/header";
import { useStackTheme } from "@/hooks/use-theme";

// A link straight to the layout editor still has Settings under it.
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const stackTheme = useStackTheme();

  // `header` isn't in useStackTheme: it imports Icon and Host, which import the theme.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="layout" />
    </Stack>
  );
}
