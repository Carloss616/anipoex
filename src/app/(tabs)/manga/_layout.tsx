import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useStackTheme } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();

  return (
    <Stack screenOptions={stackTheme}>
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
    </Stack>
  );
}
