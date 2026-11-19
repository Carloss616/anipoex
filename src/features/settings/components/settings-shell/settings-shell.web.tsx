import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { View } from "react-native";
import { HeaderInsetView } from "@/components/layout/header-inset-view";
import type { SettingsShellProps } from "./settings-shell";
import { SettingsSidebar } from "./settings-sidebar";

export const useSettingsSplit = () => useBreakpoint().isAtLeast("lg");

/** From lg, a sidebar of the pages beside the stack, as seanime's settings. */
export function SettingsShell({ children }: SettingsShellProps) {
  if (!useSettingsSplit()) return children;

  return (
    <View className="flex-1 flex-row">
      <HeaderInsetView className="gutters pb-gb pl-gx box-content w-56 pt-4 pr-4">
        <SettingsSidebar />
      </HeaderInsetView>
      <View className="flex-1">{children}</View>
    </View>
  );
}
