import { Stack } from "expo-router";
import { header } from "@/components/layout/header";
import { mangaStackScreens } from "@/features/manga/utils/manga-stack-screens";
import { useStackTheme, useThemeM3Colors } from "@/hooks/use-theme";

// A link straight to /search or a manga still has Home under it.
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const stackTheme = useStackTheme();
  const m3 = useThemeM3Colors();

  // `header` isn't in useStackTheme: it imports Icon and Host, which import the theme.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="search" />
      {mangaStackScreens(m3)}
    </Stack>
  );
}
