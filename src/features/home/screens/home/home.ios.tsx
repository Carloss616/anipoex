import { Button, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  frame,
  multilineTextAlignment,
  padding,
} from "@expo/ui/swift-ui/modifiers";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { DnsPicker } from "@/features/extensions";
import { useSignOut } from "./hooks/use-sign-out";

export function Home() {
  const { greeting, signOut } = useSignOut();
  const buttonFont = useFont("body", "medium");

  return (
    <Host className="flex-1">
      <ScrollView>
        <VStack
          spacing={16}
          modifiers={[
            padding({ horizontal: 32, vertical: 96 }),
            frame({ maxWidth: Infinity }),
          ]}
        >
          <Text
            textStyle="headline"
            modifiers={[multilineTextAlignment("center")]}
          >
            {greeting}
          </Text>
          <Button
            label="Sign out"
            onPress={signOut}
            modifiers={[buttonStyle("glass"), buttonFont]}
          />
          <ThemeToggle />
          <ThemePicker />
          <DnsPicker />
        </VStack>
      </ScrollView>
    </Host>
  );
}
