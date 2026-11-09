import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { Avatar } from "panelui-web/avatar";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { Switch } from "panelui-web/switch";
import { ScrollView } from "react-native";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import {
  DnsPicker,
  isRuntimeAvailable,
  languageName,
  languageOrder$,
} from "@/features/extensions";
import { layoutSummary } from "@/features/home/utils/home-layout";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { session$ } from "@/state/session";
import { settings$ } from "@/state/settings";
import { useSignOut } from "./hooks/use-sign-out";

/** The settings as Frames in a narrow column under the header. */
export function Settings() {
  const router = useRouter();
  const headerScroll = useHeaderScroll();
  const { greeting, signOut } = useSignOut();
  const user = useValue(session$.user);
  const layout = useValue(() => layoutSummary(settings$.home.get()));
  const autoPick = useValue(settings$.sources.autoPick);
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
            <Frame.Panel>
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
            <Frame.Panel>
              <Frame.Row
                chevron
                onClick={() => router.push("/settings/layout")}
              >
                <Frame.Content>
                  <Frame.Title as="p">Home layout</Frame.Title>
                  <Frame.Description>{layout}</Frame.Description>
                </Frame.Content>
              </Frame.Row>
            </Frame.Panel>
          </Frame>
          <Frame>
            <Frame.Header>
              <Frame.Title>Appearance</Frame.Title>
            </Frame.Header>
            <Frame.Panel>
              <Frame.Row>
                <Frame.Content>
                  <Frame.Title as="p">Theme</Frame.Title>
                  <Frame.Description>
                    Right-click to follow the system
                  </Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <ThemeToggle />
                </Frame.Actions>
              </Frame.Row>
              <Frame.Row className="flex-wrap">
                <Frame.Content className="basis-auto">
                  <Frame.Title as="p">Palette</Frame.Title>
                </Frame.Content>
                <Frame.Actions>
                  <ThemePicker />
                </Frame.Actions>
              </Frame.Row>
            </Frame.Panel>
          </Frame>
          {/* A plain browser runs no extensions: nothing to pick or resolve. */}
          {isRuntimeAvailable && (
            <Frame>
              <Frame.Header>
                <Frame.Title>Sources</Frame.Title>
              </Frame.Header>
              <Frame.Panel>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Title as="p">Pick a source after a scan</Frame.Title>
                    <Frame.Description>
                      The one with the most new chapters
                    </Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <Switch
                      label="Pick a source after a scan"
                      checked={autoPick}
                      onCheckedChange={(on) =>
                        settings$.sources.autoPick.set(on)
                      }
                    />
                  </Frame.Actions>
                </Frame.Row>
                <Frame.Row
                  chevron
                  onClick={() => router.push("/settings/languages")}
                >
                  <Frame.Content>
                    <Frame.Title as="p">Languages</Frame.Title>
                    <Frame.Description>{languages}</Frame.Description>
                  </Frame.Content>
                </Frame.Row>
              </Frame.Panel>
            </Frame>
          )}
          {isRuntimeAvailable && (
            <Frame>
              <Frame.Header>
                <Frame.Title>Network</Frame.Title>
              </Frame.Header>
              <Frame.Panel>
                <Frame.Row>
                  <Frame.Content>
                    <Frame.Title as="p">DNS</Frame.Title>
                    <Frame.Description>
                      The resolver extensions use
                    </Frame.Description>
                  </Frame.Content>
                  <Frame.Actions>
                    <DnsPicker />
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
