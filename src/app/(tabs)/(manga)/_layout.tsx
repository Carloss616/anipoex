import { Stack } from "expo-router";
import { Platform } from "react-native";
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
      <Stack.Screen
        name="manga/custom-lists"
        options={Platform.select({
          web: {
            presentation: "transparentModal",
            headerShown: false,
          },
          ios: {
            presentation: "formSheet",
            headerShown: false,
            sheetGrabberVisible: true,
            sheetAllowedDetents: [0.5, 1],
          },
          default: {
            presentation: "formSheet",
            headerShown: false,
            sheetAllowedDetents: [0.5, 1],
            sheetCornerRadius: 28,
            contentStyle: { backgroundColor: m3?.surfaceContainerLow },
          },
        })}
      />
      {mangaStackScreens(m3)}
    </Stack>
  );
}
