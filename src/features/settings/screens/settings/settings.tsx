import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { ButtonGroup } from "panelui-web/button-group";
import { Frame } from "panelui-web/frame";
import { Select } from "panelui-web/select";
import { Switch } from "panelui-web/switch";
import { ScrollView } from "react-native";
import { PaletteRail } from "@/components/blocks/palette-rail";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { Icon } from "@/components/ui/icon";
import {
  DNS_OPTIONS,
  isRuntimeAvailable,
  languageName,
  languageOrder$,
  selectDns,
  useDns,
  useLoadInstalled,
} from "@/features/extensions";
import { PRESET_LABELS } from "@/features/home/constants";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS, THEME_OPTIONS } from "./constants";
import { useSignOut } from "./hooks/use-sign-out";

const DNS_ITEMS = DNS_OPTIONS.map(({ id, name }) => ({
  value: id,
  label: name,
}));
const SLOW_SKIP_ITEMS = SLOW_SKIP_OPTIONS.map(({ seconds, label }) => ({
  value: String(seconds),
  label,
}));

/** The settings as Frames in a narrow column under the header. */
export function Settings() {
  useLoadInstalled();
  const router = useRouter();
  const headerScroll = useHeaderScroll();
  const { greeting, signOut } = useSignOut();
  const user = useValue(session$.user);
  const layout = useValue(() => PRESET_LABELS[settings$.home.preset.get()]);
  const autoPick = useValue(settings$.sources.autoPick);
  const slowSkip = useValue(() => String(settings$.sources.slowSkip.get()));
  const preference = useValue(settings$.theme.preference);
  const { dns } = useDns();
  const languages = useValue(() =>
    languageOrder$.get().map(languageName).join(", "),
  );

  return (
    <>
      <Stack.Title large>Settings</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-4 self-center">
          <Frame className="mt-4">
            <Frame.Header>
              <Frame.Title>Account</Frame.Title>
            </Frame.Header>
            <Frame.Panel data-attached="column">
              <Frame.Row>
                <Frame.Media>
                  <Avatar
                    src={user?.avatarUrl ?? undefined}
                    name={user?.name}
                  />
                </Frame.Media>
                <Frame.Content>
                  <Frame.Title as="p">{greeting}</Frame.Title>
                  <Frame.Description>Signed in with AniList</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Button variant="ghost" onClick={signOut}>
                    Sign out
                  </Button>
                </Frame.Actions>
              </Frame.Row>
            </Frame.Panel>
          </Frame>
          <Frame>
            <Frame.Header>
              <Frame.Title>Home</Frame.Title>
            </Frame.Header>
            <Frame.Panel data-attached="column">
              <Frame.Row
                chevron
                onClick={() => router.push("/settings/layout")}
              >
                <Frame.Content>
                  <Frame.Title as="p">Layout</Frame.Title>
                  <Frame.Description>{DESCRIPTIONS.layout}</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Typography type="body-sm" muted>
                    {layout}
                  </Typography>
                </Frame.Actions>
              </Frame.Row>
            </Frame.Panel>
          </Frame>
          <Frame>
            <Frame.Header>
              <Frame.Title>Appearance</Frame.Title>
            </Frame.Header>
            <Frame.Panel data-attached="column">
              <Frame.Row className="flex-wrap">
                <Frame.Content className="basis-auto">
                  <Frame.Title as="p">Theme</Frame.Title>
                </Frame.Content>
                <Frame.Actions>
                  <ButtonGroup aria-label="Theme">
                    {THEME_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        size="sm"
                        variant={
                          preference === option.id ? "secondary" : "outline"
                        }
                        aria-pressed={preference === option.id}
                        onClick={() =>
                          settings$.theme.preference.set(option.id)
                        }
                      >
                        <Icon name={option.icon} />
                        {option.label}
                      </Button>
                    ))}
                  </ButtonGroup>
                </Frame.Actions>
              </Frame.Row>
              <Frame.Row className="flex-col items-stretch gap-2 px-0 pb-0">
                <Frame.Content className="px-4">
                  <Frame.Title as="p">Palette</Frame.Title>
                </Frame.Content>
                <PaletteRail />
              </Frame.Row>
            </Frame.Panel>
          </Frame>
          {/* A plain browser runs no extensions: nothing to pick or resolve. */}
          {isRuntimeAvailable && (
            <Frame>
              <Frame.Header>
                <Frame.Title>Sources</Frame.Title>
              </Frame.Header>
              <Frame.Panel data-attached="column">
                {/* A label hands its click to the switch inside. */}
                <Frame.Row
                  // biome-ignore lint/a11y/noLabelWithoutControl: the Switch below is its control.
                  render={<label />}
                >
                  <Frame.Content>
                    <Frame.Title as="p">Auto-pick a source</Frame.Title>
                    <Frame.Description>
                      {DESCRIPTIONS.autoPick}
                    </Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <Switch
                      name="auto-pick-source"
                      label="Auto-pick a source"
                      checked={autoPick}
                      onCheckedChange={(on) =>
                        settings$.sources.autoPick.set(on)
                      }
                    />
                  </Frame.Actions>
                </Frame.Row>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Title as="p">Skip slow sources</Frame.Title>
                    <Frame.Description>
                      {DESCRIPTIONS.slowSkip}
                    </Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <Select
                      items={SLOW_SKIP_ITEMS}
                      value={slowSkip}
                      onValueChange={(value) =>
                        value && settings$.sources.slowSkip.set(Number(value))
                      }
                    >
                      <Select.Trigger
                        variant="ghost"
                        aria-label="Skip slow sources"
                      >
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {SLOW_SKIP_ITEMS.map((item) => (
                          <Select.Item key={item.value} value={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Frame.Actions>
                </Frame.Row>
                <Frame.Row
                  chevron
                  onClick={() => router.push("/settings/languages")}
                >
                  <Frame.Content>
                    <Frame.Title as="p">Languages</Frame.Title>
                  </Frame.Content>
                  <Frame.Actions className="max-w-1/2">
                    <Typography type="body-sm" muted numberOfLines={1}>
                      {languages}
                    </Typography>
                  </Frame.Actions>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
          )}
          {isRuntimeAvailable && (
            <Frame>
              <Frame.Header>
                <Frame.Title>Network</Frame.Title>
              </Frame.Header>
              <Frame.Panel data-attached="column">
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Title as="p">DNS</Frame.Title>
                    <Frame.Description>{DESCRIPTIONS.dns}</Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <Select
                      items={DNS_ITEMS}
                      value={dns}
                      onValueChange={(id) => id && selectDns(id)}
                    >
                      <Select.Trigger variant="ghost" aria-label="DNS">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {DNS_ITEMS.map((item) => (
                          <Select.Item key={item.value} value={item.value}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Frame.Actions>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
          )}
        </HeaderInsetView>
      </ScrollView>
    </>
  );
}
