import { Stack } from "expo-router";
import { header } from "@/components/layout/header";
import { mangaStackScreens } from "@/features/manga/utils/manga-stack-screens";
import { useStackTheme, useThemeM3Colors } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();
  const m3 = useThemeM3Colors();

  // Not in useStackTheme: `header` imports Icon and Host, which import it.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="manga/index" />
      {mangaStackScreens(m3)}
    </Stack>
  );
}
