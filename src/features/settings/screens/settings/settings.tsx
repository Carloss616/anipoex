import { Stack } from "expo-router";
import { ScrollView } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { AccountSection } from "./components/account-section";
import { ActivitySection } from "./components/activity-section";
import { AppearanceSection } from "./components/appearance-section";
import { HomeSection } from "./components/home-section";
import { NetworkSection } from "./components/network-section";
import { SourcesSection } from "./components/sources-section";

/** The settings as Frames in a narrow column under the header. */
export function Settings() {
  useLoadInstalled();
  const headerScroll = useHeaderScroll();

  return (
    <>
      <Stack.Title large>Settings</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-4 self-center">
          <ActivitySection />
          <AccountSection />
          <HomeSection />
          <AppearanceSection />
          {/* A plain browser runs no extensions: nothing to pick or resolve. */}
          {isRuntimeAvailable && <SourcesSection />}
          {isRuntimeAvailable && <NetworkSection />}
        </HeaderInsetView>
      </ScrollView>
    </>
  );
}
