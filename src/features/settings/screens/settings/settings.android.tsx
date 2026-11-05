import { Column, OutlinedButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { Stack } from "expo-router";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { DnsPicker } from "@/features/extensions";
import { useSignOut } from "./hooks/use-sign-out";

export function Settings() {
  const { greeting, signOut } = useSignOut();

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <Host className="flex-1">
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          horizontalAlignment="center"
          modifiers={[
            verticalScroll(),
            fillMaxWidth(),
            padding(32, 96, 32, 96),
          ]}
        >
          <Text
            style={{
              typography: "titleMedium",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {greeting}
          </Text>
          <OutlinedButton onClick={signOut}>
            <Text style={{ typography: "labelLarge" }}>Sign out</Text>
          </OutlinedButton>
          <ThemeToggle />
          <ThemePicker />
          <DnsPicker />
        </Column>
      </Host>
    </>
  );
}
