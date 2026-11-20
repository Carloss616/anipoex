import { Stack } from "expo-router";
import { header } from "@/components/layout/header";
import {
  SettingsShell,
  useSettingsSplit,
} from "@/features/settings/components/settings-shell";
import { useStackTheme } from "@/hooks/use-theme";

// A link straight to a settings page still has Settings under it.
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const stackTheme = useStackTheme();
  // Beside the sidebar a page replaces the last one: nothing to go back to.
  const split = useSettingsSplit();

  // Not in useStackTheme: `header` imports Icon and Host, which import it.
  return (
    <SettingsShell>
      <Stack
        screenOptions={{ ...stackTheme, header, headerBackVisible: !split }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="account" />
        <Stack.Screen name="appearance" />
        <Stack.Screen name="sync" />
        <Stack.Screen name="about" />
        <Stack.Screen name="sources" />
        <Stack.Screen name="downloads" />
        <Stack.Screen name="activity" />
        {/* Pushed even beside the sidebar: from Sources, from a toast. */}
        <Stack.Screen name="pending" options={{ headerBackVisible: true }} />
        <Stack.Screen name="layout" />
        <Stack.Screen name="languages" options={{ headerBackVisible: true }} />
      </Stack>
    </SettingsShell>
  );
}
