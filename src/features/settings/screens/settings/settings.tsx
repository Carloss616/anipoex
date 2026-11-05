import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { Typography } from "panelui-native/components/typography";
import { Button } from "panelui-web/button";
import { Frame } from "panelui-web/frame";
import { ScrollView, View } from "react-native";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { DnsPicker } from "@/features/extensions";
import { homeLayout$, layoutSummary } from "@/features/home/state/home-layout";
import { useSignOut } from "./hooks/use-sign-out";

export function Settings() {
  const router = useRouter();
  const { greeting, signOut } = useSignOut();
  const layout = useValue(() => layoutSummary(homeLayout$.get()));

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <ScrollView className="flex-1">
        <View className="flex-1 items-center justify-center gap-4 px-8 py-24">
          <Typography type="h5" align="center">
            {greeting}
          </Typography>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
          <ThemeToggle />
          <ThemePicker />
          <DnsPicker />
          <Frame className="w-full max-w-md">
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
        </View>
      </ScrollView>
    </>
  );
}
