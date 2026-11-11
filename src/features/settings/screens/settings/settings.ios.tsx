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
  fixedSize,
  foregroundStyle,
  frame,
  labelsHidden,
  listRowBackground,
  listRowInsets,
  listRowSeparator,
  listStyle,
  onTapGesture,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { PaletteRail } from "@/components/blocks/palette-rail";
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
import { THEME_FAMILIES, type ThemePreference } from "@/state/theme/constants";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS, THEME_OPTIONS } from "./constants";
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
  const familyName = useValue(
    () =>
      THEME_FAMILIES.find((entry) => entry.id === settings$.theme.family.get())
        ?.name ?? "",
  );
  const { dns } = useDns();
  const languages = useValue(() =>
    languageOrder$.get().map(languageName).join(", "),
  );
  const avatarUrl = useValue(session$.user.avatarUrl);
  const initial = useValue(() => session$.user.name.get()?.[0] ?? "?");
  const [primary, card, surfaceSecondary] = useThemeColor([
    "primary",
    "card",
    "surface-secondary",
  ]);
  const rowBackground = listRowBackground(surfaceSecondary);

  return (
    <>
      <Stack.Title large>Settings</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
            useFont(),
          ]}
        >
          <Section modifiers={[rowBackground]}>
            <HStack spacing={12}>
              <ZStack
                modifiers={[
                  frame({ width: AVATAR, height: AVATAR }),
                  background(card),
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
          <Section modifiers={[rowBackground]} title="Home">
            <Button onPress={() => router.push("/settings/layout")}>
              <HStack spacing={8}>
                <VStack alignment="leading">
                  <Text modifiers={[foregroundStyle("primary")]}>Layout</Text>
                  <Text
                    textStyle="subheadline"
                    modifiers={[foregroundStyle("secondary")]}
                  >
                    {DESCRIPTIONS.layout}
                  </Text>
                </VStack>
                <Spacer />
                <Text modifiers={[foregroundStyle("secondary")]}>{layout}</Text>
                <Icon name={Icons.chevronRight} size={13} muted />
              </HStack>
            </Button>
          </Section>
          <Section modifiers={[rowBackground]} title="Appearance">
            {/* A menu Picker keeps its first tint: rebuild it on a new one. */}
            <Picker
              key={primary}
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
            <HStack modifiers={[listRowSeparator("hidden")]}>
              <Text>Palette</Text>
              <Spacer />
              <Text modifiers={[foregroundStyle(primary)]}>{familyName}</Text>
            </HStack>
            <VStack
              modifiers={[
                listRowInsets({ top: 0, leading: 0, bottom: 0, trailing: 0 }),
              ]}
            >
              <PaletteRail />
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
              <Text
                textStyle="subheadline"
                modifiers={[foregroundStyle("secondary")]}
              >
                {DESCRIPTIONS.autoPick}
              </Text>
            </Toggle>
            {/* With a two-line label, a menu Picker drops its value below it. */}
            <HStack>
              <VStack alignment="leading">
                <Text>Skip slow sources</Text>
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {DESCRIPTIONS.slowSkip}
                </Text>
              </VStack>
              <Spacer />
              <Picker
                key={primary}
                label={<Text>Skip slow sources</Text>}
                selection={slowSkip}
                onSelectionChange={(seconds: number | null) =>
                  seconds !== null && settings$.sources.slowSkip.set(seconds)
                }
                modifiers={[labelsHidden(), fixedSize()]}
              >
                {SLOW_SKIP_OPTIONS.map((option) => (
                  <Text key={option.seconds} modifiers={[tag(option.seconds)]}>
                    {option.label}
                  </Text>
                ))}
              </Picker>
            </HStack>
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
            <HStack>
              <VStack alignment="leading">
                <Text>DNS</Text>
                <Text
                  textStyle="subheadline"
                  modifiers={[foregroundStyle("secondary")]}
                >
                  {DESCRIPTIONS.dns}
                </Text>
              </VStack>
              <Spacer />
              <Picker
                key={primary}
                label={<Text>DNS</Text>}
                selection={dns}
                onSelectionChange={(id: DnsId | null) => id && selectDns(id)}
                modifiers={[labelsHidden(), fixedSize()]}
              >
                {DNS_OPTIONS.map((option) => (
                  <Text key={option.id} modifiers={[tag(option.id)]}>
                    {option.name}
                  </Text>
                ))}
              </Picker>
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
