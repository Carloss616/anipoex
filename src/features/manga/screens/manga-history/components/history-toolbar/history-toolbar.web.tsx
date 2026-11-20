import { Stack } from "expo-router";
import { useState } from "react";
import { Toolbar } from "@/components/layout/toolbar";
import { Icons } from "@/components/ui/icon";
import { useThemeColor } from "@/hooks/use-theme-color";
import type { HistoryToolbarProps } from "./history-toolbar";

/** Refresh, in place of the pull to refresh the web lacks. */
export function HistoryToolbar({ onRefresh }: HistoryToolbarProps) {
  const [refreshing, setRefreshing] = useState(false);
  const mutedForeground = useThemeColor("muted-foreground");

  const refresh = () => {
    setRefreshing(true);
    onRefresh().finally(() => setRefreshing(false));
  };

  return (
    <Toolbar loading={refreshing}>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon={Icons.refresh}
          onPress={refresh}
          disabled={refreshing}
          tintColor={refreshing ? mutedForeground : undefined}
          accessibilityLabel="Refresh"
        />
      </Stack.Toolbar>
    </Toolbar>
  );
}
