import DnsIcon from "@expo/material-symbols/dns.xml";
import HourglassIcon from "@expo/material-symbols/hourglass.xml";
import ManageSearchIcon from "@expo/material-symbols/manage_search.xml";
import TranslateIcon from "@expo/material-symbols/translate.xml";
import TuneIcon from "@expo/material-symbols/tune.xml";
import {
  Box,
  Column,
  FilledTonalButton,
  Row,
  Switch,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
  fillMaxSize,
  fillMaxWidth,
  matchParentSize,
  padding,
  Shapes,
  size,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { PaletteRail } from "@/components/blocks/palette-rail";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import {
  languageName,
  languageOrder$,
  useDns,
  useLoadInstalled,
} from "@/features/extensions";
import { PRESET_LABELS } from "@/features/home/constants";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { THEME_FAMILIES } from "@/state/theme";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS, THEME_OPTIONS } from "./constants";
import { useSignOut } from "./hooks/use-sign-out";

/** M3 Expressive settings: labelled groups of segmented rows. */
export function Settings() {
  useLoadInstalled();
  const { greeting, signOut } = useSignOut();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();
  const m3 = useThemeM3Colors();
  // The preset alone: the count squeezes the description beside it.
  const layout = useValue(() => PRESET_LABELS[settings$.home.preset.get()]);
  const avatarUrl = useValue(session$.user.avatarUrl);
  const name = useValue(session$.user.name);
  const preference = useValue(settings$.theme.preference);
  const familyName = useValue(
    () =>
      THEME_FAMILIES.find((entry) => entry.id === settings$.theme.family.get())
        ?.name ?? "",
  );
  const theme =
    THEME_OPTIONS.find((option) => option.id === preference) ??
    THEME_OPTIONS[0];
  const autoPick = useValue(settings$.sources.autoPick);
  const dns = useDns();
  const languages = useValue(() =>
    languageOrder$.get().map(languageName).join(", "),
  );
  const toggleAutoPick = () => settings$.sources.autoPick.set((on) => !on);
  const slowSkip = useValue(settings$.sources.slowSkip);
  const slowSkipItems = SLOW_SKIP_OPTIONS.map((option) => ({
    label: option.label,
    checked: option.seconds === slowSkip,
    onPress: () => settings$.sources.slowSkip.set(option.seconds),
  }));
  const slowSkipLabel =
    SLOW_SKIP_OPTIONS.find((option) => option.seconds === slowSkip)?.label ??
    `${slowSkip} s`;
  // Values and switches stay level with the title when a description wraps.
  const row = {
    colors: { containerColor: m3.surfaceContainerLow },
    verticalAlignment: "center",
  } as const;

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <Box
          modifiers={[fillMaxSize(), pinnedScrollBehavior(setHeaderScrolled)]}
        >
          <Column
            modifiers={[
              verticalScroll(),
              fillMaxWidth(),
              padding(GUTTER, 8, GUTTER, GUTTER),
            ]}
          >
            <SegmentedListItem index={0} count={1} {...row}>
              <SegmentedListItem.Leading>
                <Box
                  contentAlignment="center"
                  modifiers={[
                    size(40, 40),
                    clip(Shapes.Circle),
                    background(m3.primaryContainer),
                  ]}
                >
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      modifiers={[matchParentSize()]}
                    />
                  ) : (
                    <Text
                      style={{ typography: "titleMedium" }}
                      color={m3.onPrimaryContainer}
                    >
                      {name?.[0]?.toUpperCase() ?? "?"}
                    </Text>
                  )}
                </Box>
              </SegmentedListItem.Leading>
              <Text>{greeting}</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  Signed in with AniList
                </Text>
              </SegmentedListItem.Supporting>
            </SegmentedListItem>

            <Label>Home</Label>
            <SegmentedListItem
              index={0}
              count={1}
              {...row}
              onPress={() => router.push("/settings/layout")}
            >
              <SegmentedListItem.Leading>
                <LeadingIcon name={TuneIcon} />
              </SegmentedListItem.Leading>
              <Text>Layout</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  {DESCRIPTIONS.layout}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Row verticalAlignment="center">
                  <Text>{layout}</Text>
                  <Icon name={Icons.chevronRight} color="inherit" />
                </Row>
              </SegmentedListItem.Trailing>
            </SegmentedListItem>

            <Label>Appearance</Label>
            <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
              <Menu
                items={THEME_OPTIONS.map((option) => ({
                  label: option.label,
                  icon: option.icon,
                  checked: option.id === preference,
                  onPress: () => settings$.theme.preference.set(option.id),
                }))}
              >
                <SegmentedListItem index={0} count={3} {...row}>
                  <SegmentedListItem.Leading>
                    <LeadingIcon name={theme.icon} />
                  </SegmentedListItem.Leading>
                  <Text>Theme</Text>
                  <SegmentedListItem.Trailing>
                    <Row verticalAlignment="center">
                      <Text>{theme.label}</Text>
                      <Icon name={Icons.chevronDown} color="inherit" />
                    </Row>
                  </SegmentedListItem.Trailing>
                </SegmentedListItem>
              </Menu>
              <Column>
                {/* Squared where they meet: the rail reads as part of this row. */}
                <SegmentedListItem
                  index={1}
                  count={3}
                  {...row}
                  shape={{ bottomStart: 0, bottomEnd: 0 }}
                >
                  <SegmentedListItem.Leading>
                    <LeadingIcon name={theme.icon} />
                  </SegmentedListItem.Leading>
                  <Text>Palette</Text>
                  <SegmentedListItem.Trailing>
                    <Text>{familyName}</Text>
                  </SegmentedListItem.Trailing>
                </SegmentedListItem>
                <SegmentedListItem
                  index={2}
                  count={3}
                  {...row}
                  shape={{ topStart: 0, topEnd: 0 }}
                  contentPadding={{ start: 0, top: 0, end: 0, bottom: 0 }}
                >
                  <PaletteRail />
                </SegmentedListItem>
              </Column>
            </Column>

            <Label>Sources</Label>
            <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
              <SegmentedListItem
                index={0}
                count={3}
                {...row}
                onPress={toggleAutoPick}
              >
                <SegmentedListItem.Leading>
                  <LeadingIcon name={ManageSearchIcon} />
                </SegmentedListItem.Leading>
                <Text>Auto-pick a source</Text>
                <SegmentedListItem.Supporting>
                  <Text style={{ typography: "bodyMedium" }}>
                    {DESCRIPTIONS.autoPick}
                  </Text>
                </SegmentedListItem.Supporting>
                <SegmentedListItem.Trailing>
                  <Switch value={autoPick} onCheckedChange={toggleAutoPick} />
                </SegmentedListItem.Trailing>
              </SegmentedListItem>
              <Menu items={slowSkipItems}>
                <SegmentedListItem index={1} count={3} {...row}>
                  <SegmentedListItem.Leading>
                    <LeadingIcon name={HourglassIcon} />
                  </SegmentedListItem.Leading>
                  <Text>Skip slow sources</Text>
                  <SegmentedListItem.Supporting>
                    <Text style={{ typography: "bodyMedium" }}>
                      {DESCRIPTIONS.slowSkip}
                    </Text>
                  </SegmentedListItem.Supporting>
                  <SegmentedListItem.Trailing>
                    <Row verticalAlignment="center">
                      <Text>{slowSkipLabel}</Text>
                      <Icon name={Icons.chevronDown} color="inherit" />
                    </Row>
                  </SegmentedListItem.Trailing>
                </SegmentedListItem>
              </Menu>
              <SegmentedListItem
                index={2}
                count={3}
                {...row}
                onPress={() => router.push("/settings/languages")}
              >
                <SegmentedListItem.Leading>
                  <LeadingIcon name={TranslateIcon} />
                </SegmentedListItem.Leading>
                <Text>Languages</Text>
                <SegmentedListItem.Trailing>
                  <Row verticalAlignment="center">
                    <Text>{languages}</Text>
                    <Icon name={Icons.chevronRight} muted />
                  </Row>
                </SegmentedListItem.Trailing>
              </SegmentedListItem>
            </Column>

            <Label>Network</Label>
            <Menu items={dns.items}>
              <SegmentedListItem index={0} count={1} {...row}>
                <SegmentedListItem.Leading>
                  <LeadingIcon name={DnsIcon} />
                </SegmentedListItem.Leading>
                <Text>DNS</Text>
                <SegmentedListItem.Supporting>
                  <Text style={{ typography: "bodyMedium" }}>
                    {DESCRIPTIONS.dns}
                  </Text>
                </SegmentedListItem.Supporting>
                <SegmentedListItem.Trailing>
                  <Row verticalAlignment="center">
                    {dns.name && <Text>{dns.name}</Text>}
                    <Icon name={Icons.chevronDown} color="inherit" />
                  </Row>
                </SegmentedListItem.Trailing>
              </SegmentedListItem>
            </Menu>

            <Box
              contentAlignment="center"
              modifiers={[fillMaxWidth(), padding(0, 24, 0, 0)]}
            >
              <FilledTonalButton
                onClick={signOut}
                colors={{
                  containerColor: m3.errorContainer,
                  contentColor: m3.onErrorContainer,
                }}
              >
                <Text>Sign out</Text>
              </FilledTonalButton>
            </Box>
          </Column>
        </Box>
      </Host>
    </>
  );
}

function Label({ children }: { children: string }) {
  const m3 = useThemeM3Colors();

  return (
    <Text
      style={{ typography: "titleSmall" }}
      color={m3.primary}
      modifiers={[padding(4, 24, 4, 8)]}
    >
      {children}
    </Text>
  );
}

function LeadingIcon({ name }: { name: IconName }) {
  const m3 = useThemeM3Colors();

  return (
    <Box
      contentAlignment="center"
      modifiers={[
        size(40, 40),
        clip(Shapes.Circle),
        background(m3.surfaceContainerHigh),
      ]}
    >
      <Icon name={name} color="inherit" />
    </Box>
  );
}
