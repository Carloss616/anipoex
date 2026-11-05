import TuneIcon from "@expo/material-symbols/tune.xml";
import { Column, OutlinedButton } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack, useRouter } from "expo-router";
import { useHeaderHeight } from "expo-router/react-navigation";
import { ThemePicker } from "@/components/blocks/theme-picker";
import { ThemeToggle } from "@/components/blocks/theme-toggle";
import { SegmentedListItem } from "@/components/native/jetpack-compose/segmented-list-item";
import { Text } from "@/components/native/jetpack-compose/text";
import { Host } from "@/components/ui/host";
import { Icon, Icons } from "@/components/ui/icon";
import { DnsPicker } from "@/features/extensions";
import { homeLayout$, layoutSummary } from "@/features/home/state/home-layout";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { useSignOut } from "./hooks/use-sign-out";

export function Settings() {
  const { greeting, signOut } = useSignOut();
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const m3 = useThemeM3Colors();
  const layout = useValue(() => layoutSummary(homeLayout$.get()));

  return (
    <>
      <Stack.Title>Settings</Stack.Title>
      <Host className="flex-1" style={{ marginTop: headerHeight }}>
        <Column
          verticalArrangement={{ spacedBy: 16 }}
          horizontalAlignment="center"
          modifiers={[
            verticalScroll(),
            fillMaxWidth(),
            padding(32, 32, 32, 96),
          ]}
        >
          <Text
            style={{
              typography: "titleMedium",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {greeting}
          </Text>
          <OutlinedButton onClick={signOut}>
            <Text style={{ typography: "labelLarge" }}>Sign out</Text>
          </OutlinedButton>
          <SegmentedListItem
            index={0}
            count={1}
            containerColor={m3.surfaceContainerLow}
            onPress={() => router.push("/settings/layout")}
            modifiers={[fillMaxWidth()]}
          >
            <SegmentedListItem.Leading>
              <Icon name={TuneIcon} muted />
            </SegmentedListItem.Leading>
            <Text>Home layout</Text>
            <SegmentedListItem.Supporting>
              <Text style={{ typography: "bodyMedium" }}>{layout}</Text>
            </SegmentedListItem.Supporting>
            <SegmentedListItem.Trailing>
              <Icon name={Icons.chevronRight} muted />
            </SegmentedListItem.Trailing>
          </SegmentedListItem>
          <ThemeToggle />
          <ThemePicker />
          <DnsPicker />
        </Column>
      </Host>
    </>
  );
}
