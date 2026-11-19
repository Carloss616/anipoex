import { Box, Column } from "@expo/ui/jetpack-compose";
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
import { Host } from "@/components/ui/host";
import { useSetHeaderScrolled } from "@/hooks/use-header-scroll";
import type { SettingsPageProps } from "./settings-page";

/** M3 Expressive settings: labelled groups of segmented rows. */
export function SettingsPage({ title, children, overlays }: SettingsPageProps) {
  const headerHeight = useHeaderHeight();
  const setHeaderScrolled = useSetHeaderScrolled();

  return (
    <>
      <Stack.Title>{title}</Stack.Title>
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
            {children}
          </Column>
        </Box>
        {overlays}
      </Host>
    </>
  );
}
