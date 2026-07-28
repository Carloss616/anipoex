import { Stack } from "expo-router";
import { appHeader } from "@/components/app";

export default function Layout() {
  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        header: appHeader,
        headerBlurEffect: "systemChromeMaterial",
        headerShadowVisible: false,
        headerLargeStyle: { backgroundColor: "transparent" },
        headerBackButtonDisplayMode: "minimal",
      }}
    />
  );
}
