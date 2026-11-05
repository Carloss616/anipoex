import { Stack } from "expo-router";
import { Platform } from "react-native";
import type { useThemeM3Colors } from "@/hooks/use-theme";
import { DETAIL_ROUTE } from "./source-list-href";

/**
 * The manga detail, reader and sources: Home's and Manga's stacks both push
 * them, so a manga opened from either tab stays in it (`(home,manga)` routes).
 */
export function mangaStackScreens(m3: ReturnType<typeof useThemeM3Colors>) {
  return [
    <Stack.Screen key="detail" name={DETAIL_ROUTE} />,
    <Stack.Screen
      key="reader"
      name="manga/[id]/reader"
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
    />,
    <Stack.Screen
      key="sources"
      name="manga/[id]/sources"
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
    />,
  ];
}
