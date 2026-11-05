import { Stack } from "expo-router";
import { Platform } from "react-native";
import { header } from "@/components/layout/header";
import { useStackTheme, useThemeM3Colors } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();
  const m3 = useThemeM3Colors();

  // `header` isn't in useStackTheme: it imports Icon and Host, which import the theme.
  return (
    <Stack screenOptions={{ ...stackTheme, header }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]/index" />
      <Stack.Screen
        name="[id]/reader"
        options={{
          // The web header blurs what scrolls under it only with a shadow.
          headerShadowVisible: Platform.OS === "web",
          // Opens like a full-screen page; the tab bar hides for it (`Tabs`).
          animation: "slide_from_bottom",
          // Pages run to the edges; the header's own blur covers the top.
          scrollEdgeEffects: {
            top: "hidden",
            bottom: "hidden",
            left: "hidden",
            right: "hidden",
          },
        }}
      />
      <Stack.Screen
        name="[id]/sources"
        options={({ route }) => {
          // "Search on …" opens it raised.
          const expanded = (route.params as { expanded?: string } | undefined)
            ?.expanded;
          const initial = expanded ? ("last" as const) : 0;
          return Platform.select({
            web: { presentation: "transparentModal", headerShown: false },
            ios: {
              presentation: "formSheet",
              headerShown: false,
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.5, 1],
              sheetInitialDetentIndex: initial,
            },
            default: {
              presentation: "formSheet",
              headerShown: false,
              sheetAllowedDetents: [0.5, 1],
              sheetInitialDetentIndex: initial,
              sheetCornerRadius: 28,
              contentStyle: { backgroundColor: m3?.surfaceContainerLow },
            },
          });
        }}
      />
    </Stack>
  );
}
