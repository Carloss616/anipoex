import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { Tabs } from "panelui-native/components/tabs";
import { View } from "react-native";
import type { Route, TabViewProps } from "react-native-tab-view";
import { Badge } from "@/components/ui/badge";
import type { MediaListStatus } from "@/graphql/types.generated";

export type TabBarProps<T extends Route> = Parameters<
  NonNullable<TabViewProps<T>["renderTabBar"]>
>[0] & {
  counts$: Observable<Record<MediaListStatus, number | null>>;
};

export function TabBar<T extends Route>({
  navigationState: { index, routes },
  counts$,
  jumpTo,
}: TabBarProps<T>) {
  return (
    <Tabs
      value={routes[index].key}
      defaultValue={routes[0].key}
      onValueChange={jumpTo}
      variant="underline"
      className="border-border border-b"
    >
      <Tabs.List
        scrollable
        className="gutters border-transparent px-safe-offset-gx"
      >
        {routes.map((r) => (
          <Tabs.Trigger
            key={r.key}
            value={r.key}
            badge={
              // fixed width, so a changing count never resizes the trigger and re-renders every tab
              <View className="w-9 items-end">
                <Memo>
                  {() => (
                    <Badge>
                      {counts$[r.key as MediaListStatus].get() ?? "~"}
                    </Badge>
                  )}
                </Memo>
              </View>
            }
          >
            {r.title}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs>
  );
}
