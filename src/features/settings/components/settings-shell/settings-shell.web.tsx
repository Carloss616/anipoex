import { Typography } from "panelui-native/components/typography";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { View } from "react-native";
import type { SettingsShellProps } from "./settings-shell";
import { SettingsSidebar } from "./settings-sidebar";

export const useSettingsSplit = () => useBreakpoint().isAtLeast("lg");

/** From lg, a sidebar of the pages beside the stack, as seanime's settings. */
export function SettingsShell({ children }: SettingsShellProps) {
  if (!useSettingsSplit()) return children;

  return (
    <View className="flex-1 flex-row">
      {/* Outside the stack there is no header to inset from: its row instead. */}
      <View className="gutters pb-gb pl-gx box-content w-56 py-3 pr-4">
        <View className="h-14 justify-center px-4.25">
          <Typography type="h3">Settings</Typography>
        </View>
        <SettingsSidebar />
      </View>
      <View className="flex-1">{children}</View>
    </View>
  );
}
