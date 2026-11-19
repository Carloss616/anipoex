import { Box, Column, FilledTonalButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxSize,
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { Stack } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { GUTTER } from "@/components/native/constants";
import { pinnedScrollBehavior } from "@/components/native/jetpack-compose/pinned-scroll-behavior";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { signOut } from "@/features/auth/utils/sign-out";
import { useLoadInstalled } from "@/features/extensions";
import { AccountSection } from "@/features/settings/screens/account/components/account-section";
import { AppearanceSection } from "@/features/settings/screens/appearance/components/appearance-section";
import { DownloadsSection } from "@/features/settings/screens/downloads/components/downloads-section";
import { MoveDownloadsDialog } from "@/features/settings/screens/downloads/components/move-downloads-dialog";
import { NetworkSection } from "@/features/settings/screens/sources/components/network-section";
import { SourcesSection } from "@/features/settings/screens/sources/components/sources-section";
import { SyncSection } from "@/features/settings/screens/sync/components/sync-section";
import { ConnectSheet } from "@/features/settings/screens/sync/components/sync-section/connect-sheet";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { HomeSection } from "./components/home-section";

/** M3 Expressive settings: labelled groups of segmented rows. */
export function Settings() {
  useLoadInstalled();
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();
  const m3 = useThemeM3Colors();

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
            <AccountSection />
            <SyncSection />
            <HomeSection />
            <AppearanceSection />
            <SourcesSection />
            <NetworkSection />
            <DownloadsSection />
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
        <ConnectSheet />
        <MoveDownloadsDialog />
      </Host>
    </>
  );
}
