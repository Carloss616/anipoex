import { Button, HStack, List, Section, Spacer } from "@expo/ui/swift-ui";
import { foregroundStyle, listStyle } from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { DnsPicker } from "@/features/extensions";
import { homeLayout$, layoutSummary } from "@/features/home/state/home-layout";
import { useSignOut } from "./hooks/use-sign-out";

export function Settings() {
  const router = useRouter();
  const { greeting, signOut } = useSignOut();
  const buttonFont = useFont("body");
  const layout = useValue(() => layoutSummary(homeLayout$.get()));

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <Host className="flex-1">
        <List modifiers={[listStyle("insetGrouped")]}>
          <Section>
            <Text textStyle="headline">{greeting}</Text>
          </Section>
          <Section
            title="Home"
            footer={<Text>The sections on Home and their order.</Text>}
          >
            <Button onPress={() => router.push("/settings/layout")}>
              <HStack spacing={8}>
                <Text modifiers={[foregroundStyle("primary")]}>
                  Home layout
                </Text>
                <Spacer />
                <Text modifiers={[foregroundStyle("secondary")]}>{layout}</Text>
                <Icon name={Icons.chevronRight} size={13} muted />
              </HStack>
            </Button>
          </Section>
          <Section title="Appearance">
            <HStack>
              <Text>Theme</Text>
              <Spacer />
              <ThemeToggle />
            </HStack>
            <ThemePicker />
          </Section>
          <Section title="Network">
            <HStack>
              <Text>DNS</Text>
              <Spacer />
              <DnsPicker />
            </HStack>
          </Section>
          <Section>
            <Button
              label="Sign out"
              role="destructive"
              onPress={signOut}
              modifiers={[buttonFont]}
            />
          </Section>
        </List>
      </Host>
    </>
  );
}
