import { Stack } from "expo-router";
import { useStackTheme } from "@/hooks/use-theme";

export default function Layout() {
  const stackTheme = useStackTheme();

  return <Stack screenOptions={stackTheme} />;
}
