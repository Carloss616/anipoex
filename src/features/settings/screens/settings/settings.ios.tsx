import {
  Button,
  HStack,
  Label,
  List,
  Picker,
  Section,
  Spacer,
  Toggle,
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
  onTapGesture,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Image } from "@/components/native/swift-ui/image";
import { Text, useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons, sfSymbol } from "@/components/ui/icon";
import {
  DNS_OPTIONS,
  type DnsId,
  languageName,
  languageOrder$,
  selectDns,
  useDns,
  useLoadInstalled,
} from "@/features/extensions";
import { PRESET_LABELS } from "@/features/home/constants";
import { useThemeColor } from "@/hooks/use-theme-color";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import type { ThemePreference } from "@/state/theme/constants";
import { SLOW_SKIP_OPTIONS, THEME_OPTIONS } from "./constants";
import { useSignOut } from "./hooks/use-sign-out";

const AVATAR = 40;

export function Settings() {
  useLoadInstalled();
  const router = useRouter();
  const { greeting, signOut } = useSignOut();
  const buttonFont = useFont("body");
  // The preset alone: the count doesn't fit beside the label in this font.
  const layout = useValue(() => PRESET_LABELS[settings$.home.preset.get()]);
  const autoPick = useValue(settings$.sources.autoPick);
  const slowSkip = useValue(settings$.sources.slowSkip);
  const preference = useValue(settings$.theme.preference);
  const { dns } = useDns();
  const languages = useValue(() =>
    languageOrder$.get().map(languageName).join(", "),
  );
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
            <Picker
              label={<Text>Theme</Text>}
              selection={preference}
              onSelectionChange={(id: ThemePreference) =>
                settings$.theme.preference.set(id)
              }
            >
              {THEME_OPTIONS.map((option) => (
                <Label
                  key={option.id}
                  systemImage={sfSymbol(option.icon)}
                  modifiers={[tag(option.id)]}
                >
                  <Text>{option.label}</Text>
                </Label>
              ))}
            </Picker>
            <VStack alignment="leading" spacing={10} modifiers={ROW_FILL}>
              <Text>Palette</Text>
              <ThemePicker />
            </VStack>
          </Section>
          <Section modifiers={[rowBackground]} title="Sources">
            <Toggle
              isOn={autoPick}
              onIsOnChange={(on) => settings$.sources.autoPick.set(on)}
              modifiers={[
                ...ROW_FILL,
                onTapGesture(() => settings$.sources.autoPick.set((on) => !on)),
              ]}
            >
              <Text>Auto-pick a source</Text>
              <Text modifiers={[foregroundStyle("secondary")]}>
                After a scan, the one with the most new chapters
              </Text>
            </Toggle>
            <Picker
              label={
                <VStack alignment="leading">
                  <Text>Skip slow sources</Text>
                  <Text modifiers={[foregroundStyle("secondary")]}>
                    In a Reading scan
                  </Text>
                </VStack>
              }
              selection={slowSkip}
              onSelectionChange={(seconds: number | null) =>
                seconds !== null && settings$.sources.slowSkip.set(seconds)
              }
            >
              {SLOW_SKIP_OPTIONS.map((option) => (
                <Text key={option.seconds} modifiers={[tag(option.seconds)]}>
                  {option.label}
                </Text>
              ))}
            </Picker>
            <Button onPress={() => router.push("/settings/languages")}>
              <HStack spacing={8} modifiers={ROW_FILL}>
                <Text modifiers={[foregroundStyle("primary")]}>Languages</Text>
                <Spacer />
                <Text modifiers={[foregroundStyle("secondary")]}>
                  {languages}
                </Text>
                <Icon name={Icons.chevronRight} size={13} muted />
              </HStack>
            </Button>
          </Section>
          <Section modifiers={[rowBackground]} title="Network">
            <Picker
              label={<Text>DNS</Text>}
              selection={dns}
              onSelectionChange={(id: DnsId | null) => id && selectDns(id)}
            >
              {DNS_OPTIONS.map((option) => (
                <Text key={option.id} modifiers={[tag(option.id)]}>
                  {option.name}
                </Text>
              ))}
            </Picker>
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
