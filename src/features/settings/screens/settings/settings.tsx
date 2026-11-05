import { Stack } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { ScrollView, View } from "react-native";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { DnsPicker } from "@/features/extensions";
import { useSignOut } from "./hooks/use-sign-out";

export function Settings() {
  const { greeting, signOut } = useSignOut();

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center gap-4 px-8 py-24">
          <Typography type="h5" align="center">
            {greeting}
          </Typography>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
          <ThemeToggle />
          <ThemePicker />
          <DnsPicker />
        </View>
      </ScrollView>
    </>
  );
}
