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
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { AccountSection } from "./components/account-section";
import { AppearanceSection } from "./components/appearance-section";
import { HomeSection } from "./components/home-section";
import { NetworkSection } from "./components/network-section";
import { SourcesSection } from "./components/sources-section";

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
            <HomeSection />
            <AppearanceSection />
            <SourcesSection />
            <NetworkSection />
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
