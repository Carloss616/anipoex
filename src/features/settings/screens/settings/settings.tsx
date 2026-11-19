import { Stack } from "expo-router";
import { ScrollView } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import { isRuntimeAvailable, useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "@/features/settings/screens/account/components/account-section";
import { AppearanceSection } from "@/features/settings/screens/appearance/components/appearance-section";
import { DownloadsSection } from "@/features/settings/screens/downloads/components/downloads-section";
import { MoveDownloadsDialog } from "@/features/settings/screens/downloads/components/move-downloads-dialog";
import { NetworkSection } from "@/features/settings/screens/sources/components/network-section";
import { SourcesSection } from "@/features/settings/screens/sources/components/sources-section";
import { SyncSection } from "@/features/settings/screens/sync/components/sync-section";
import { useHeaderScroll } from "@/hooks/use-header-scroll";
import { HomeSection } from "./components/home-section";

/** The settings as Frames in a narrow column under the header. */
export function Settings() {
  useLoadInstalled();
  const headerScroll = useHeaderScroll();

  return (
    <>
      <Stack.Title large>Settings</Stack.Title>
      <ScrollView className="flex-1" {...headerScroll}>
        <HeaderInsetView className="gutters px-gx pb-gb w-full max-w-2xl gap-6 self-center">
          <AccountSection />
          <SyncSection />
          <HomeSection />
          <AppearanceSection />
          {/* A plain browser runs no extensions: nothing to pick or resolve. */}
          {isRuntimeAvailable && <SourcesSection />}
          {isRuntimeAvailable && <NetworkSection />}
          {isRuntimeAvailable && <DownloadsSection />}
        </HeaderInsetView>
      </ScrollView>
      {isRuntimeAvailable && <MoveDownloadsDialog />}
    </>
  );
}
