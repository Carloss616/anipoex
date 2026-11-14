import { Button, List, Section } from "@expo/ui/swift-ui";
import {
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import { useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { signOut } from "@/features/auth/utils/sign-out";
import { useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "./components/account-section";
import { AppearanceSection } from "./components/appearance-section";
import { HomeSection } from "./components/home-section";
import { NetworkSection } from "./components/network-section";
import { SourcesSection } from "./components/sources-section";
import { useRowBackground } from "./hooks/use-row-background";

export function Settings() {
  useLoadInstalled();
  const buttonFont = useFont("body");
  const rowBackground = useRowBackground();

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
          <AccountSection />
          <HomeSection />
          <AppearanceSection />
          <SourcesSection />
          <NetworkSection />
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
