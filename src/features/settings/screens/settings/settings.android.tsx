import ContrastIcon from "@expo/material-symbols/contrast.xml";
import DnsIcon from "@expo/material-symbols/dns.xml";
import ManageSearchIcon from "@expo/material-symbols/manage_search.xml";
import PaletteIcon from "@expo/material-symbols/palette.xml";
import TranslateIcon from "@expo/material-symbols/translate.xml";
import TuneIcon from "@expo/material-symbols/tune.xml";
import {
  Box,
  Column,
  FilledTonalButton,
  Switch,
} from "@expo/ui/jetpack-compose";
import {
  background,
  clip,
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
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { GUTTER } from "@/components/native/constants";
import { Image } from "@/components/native/jetpack-compose/image";
import {
  SEGMENTED_GAP,
  SegmentedListItem,
} from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon, type IconName, Icons } from "@/components/ui/icon";
import {
  DnsPicker,
  languageName,
  languageOrder$,
  useLoadInstalled,
} from "@/features/extensions";
import { layoutSummary } from "@/features/home/utils/home-layout";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { useSignOut } from "./hooks/use-sign-out";

const PREFERENCE_LABELS = { system: "System", light: "Light", dark: "Dark" };

/** M3 Expressive settings: labelled groups of segmented rows. */
export function Settings() {
  useLoadInstalled();
  const { greeting, signOut } = useSignOut();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  const layout = useValue(() => layoutSummary(settings$.home.get()));
  const avatarUrl = useValue(session$.user.avatarUrl);
  const name = useValue(session$.user.name);
  const preference = useValue(settings$.theme.preference);
  const autoPick = useValue(settings$.sources.autoPick);
  const languages = useValue(() =>
    languageOrder$.get().map(languageName).join(", "),
  );
  const toggleAutoPick = () => settings$.sources.autoPick.set((on) => !on);
  const row = { containerColor: m3.surfaceContainerLow };

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
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
            <Text style={{ typography: "titleMedium" }}>{greeting}</Text>
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
            <Text>Home layout</Text>
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>{layout}</Text>
            </SegmentedListItem.Supporting>
            <SegmentedListItem.Trailing>
              <Icon name={Icons.chevronRight} muted />
            </SegmentedListItem.Trailing>
          </SegmentedListItem>

          <Label>Appearance</Label>
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            <SegmentedListItem index={0} count={2} {...row}>
              <SegmentedListItem.Leading>
                <LeadingIcon name={ContrastIcon} />
              </SegmentedListItem.Leading>
              <Text>Theme</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  {PREFERENCE_LABELS[preference]}
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <ThemeToggle />
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
            <SegmentedListItem index={1} count={2} {...row}>
              <SegmentedListItem.Leading>
                <LeadingIcon name={PaletteIcon} />
              </SegmentedListItem.Leading>
              <Text>Palette</Text>
              <SegmentedListItem.Supporting>
                <Box modifiers={[padding(0, 8, 0, 0)]}>
                  <ThemePicker />
                </Box>
              </SegmentedListItem.Supporting>
            </SegmentedListItem>
          </Column>

          <Label>Sources</Label>
          <Column verticalArrangement={{ spacedBy: SEGMENTED_GAP }}>
            <SegmentedListItem
              index={0}
              count={2}
              {...row}
              onPress={toggleAutoPick}
            >
              <SegmentedListItem.Leading>
                <LeadingIcon name={ManageSearchIcon} />
              </SegmentedListItem.Leading>
              <Text>Auto-pick a source</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>
                  After a scan, the one with the most new chapters
                </Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Switch value={autoPick} onCheckedChange={toggleAutoPick} />
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
            <SegmentedListItem
              index={1}
              count={2}
              {...row}
              onPress={() => router.push("/settings/languages")}
            >
              <SegmentedListItem.Leading>
                <LeadingIcon name={TranslateIcon} />
              </SegmentedListItem.Leading>
              <Text>Languages</Text>
              <SegmentedListItem.Supporting>
                <Text style={{ typography: "bodyMedium" }}>{languages}</Text>
              </SegmentedListItem.Supporting>
              <SegmentedListItem.Trailing>
                <Icon name={Icons.chevronRight} muted />
              </SegmentedListItem.Trailing>
            </SegmentedListItem>
          </Column>

          <Label>Network</Label>
          <SegmentedListItem index={0} count={1} {...row}>
            <SegmentedListItem.Leading>
              <LeadingIcon name={DnsIcon} />
            </SegmentedListItem.Leading>
            <Text>DNS</Text>
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>For extensions</Text>
            </SegmentedListItem.Supporting>
            <SegmentedListItem.Trailing>
              <DnsPicker />
            </SegmentedListItem.Trailing>
          </SegmentedListItem>

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
              <Text style={{ typography: "labelLarge" }}>Sign out</Text>
            </FilledTonalButton>
          </Box>
        </Column>
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
      <Icon name={name} muted />
    </Box>
  );
}
