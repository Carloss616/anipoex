import { Stack } from "expo-router";
import { Platform } from "react-native";
import { header } from "@/components/layout/header";
import { useStackTheme, useThemeM3Colors } from "@/hooks/use-theme";

// A link straight to the sheet still opens it over the list.
export const unstable_settings = { anchor: "index" };

export default function Layout() {
  const stackTheme = useStackTheme();
  const m3 = useThemeM3Colors();

  // `header` isn't in useStackTheme: it imports Icon and Host, which import the theme.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="repos"
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
    </Stack>
  );
}
