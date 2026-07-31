import { Stack } from "expo-router";
import { header } from "@/components/layout/header";

export default function Layout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        header,
        headerBlurEffect: "systemChromeMaterial",
        headerShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBackButtonDisplayMode: "minimal",
      }}
    />
  );
}
