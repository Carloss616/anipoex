import {
  Button,
  HStack,
  List,
  Section,
  Spacer,
  VStack,
  ZStack,
} from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  foregroundStyle,
  frame,
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { DnsPicker } from "@/features/extensions";
import { PRESET_LABELS } from "@/features/home/constants";
import { homeLayout$ } from "@/features/home/state/home-layout";
import { useThemeColor } from "@/hooks/use-theme-color";
import { session$ } from "@/state/session";
import { useSignOut } from "./hooks/use-sign-out";

const AVATAR = 40;

export function Settings() {
  const router = useRouter();
  const { greeting, signOut } = useSignOut();
  const buttonFont = useFont("body");
  // The preset alone: the count doesn't fit beside the label in this font.
  const layout = useValue(() => PRESET_LABELS[homeLayout$.preset.get()]);
  const avatarUrl = useValue(session$.user.avatarUrl);
  const initial = useValue(() => session$.user.name.get()?.[0] ?? "?");
  const overlay = useThemeColor("overlay");
  // The theme's surfaces, not the system's grouped grays.
  const rowBackground = listRowBackground(useThemeColor("muted"));

  return (
    <>
      <Stack.Title large>Settings</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
          ]}
        >
          <Section modifiers={[rowBackground]}>
            <HStack spacing={12} modifiers={ROW_FILL}>
              <ZStack
                modifiers={[
                  frame({ width: AVATAR, height: AVATAR }),
                  background(overlay),
                  clipShape("circle"),
                ]}
              >
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} />
                ) : (
                  <Text textStyle="headline">{initial.toUpperCase()}</Text>
                )}
              </ZStack>
              <VStack alignment="leading" spacing={2}>
                <Text textStyle="headline">{greeting}</Text>
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  Signed in with AniList
                </Text>
              </VStack>
            </HStack>
          </Section>
          <Section
            modifiers={[rowBackground]}
            title="Home"
            footer={
              <Text textStyle="footnote">
                The sections on Home and their order.
              </Text>
            }
          >
            <Button onPress={() => router.push("/settings/layout")}>
              <HStack spacing={8} modifiers={ROW_FILL}>
                <Text modifiers={[foregroundStyle("primary")]}>
                  Home layout
                </Text>
                <Spacer />
                <Text modifiers={[foregroundStyle("secondary")]}>{layout}</Text>
                <Icon name={Icons.chevronRight} size={13} muted />
              </HStack>
            </Button>
          </Section>
          <Section modifiers={[rowBackground]} title="Appearance">
            <HStack modifiers={ROW_FILL}>
              <Text>Theme</Text>
              <Spacer />
              <ThemeToggle />
            </HStack>
            <VStack alignment="leading" spacing={10} modifiers={ROW_FILL}>
              <Text>Palette</Text>
              <ThemePicker />
            </VStack>
          </Section>
          <Section modifiers={[rowBackground]} title="Network">
            <HStack modifiers={ROW_FILL}>
              <Text>DNS</Text>
              <Spacer />
              <DnsPicker />
            </HStack>
          </Section>
          <Section modifiers={[rowBackground]}>
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
