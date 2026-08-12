import type { Observable } from "@legendapp/state";
import { Memo } from "@legendapp/state/react";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Tabs } from "heroui-native/tabs";
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
    <Tabs value={routes[index].key} onValueChange={jumpTo} variant="secondary">
      <Tabs.List className="w-full">
        <Tabs.ScrollView
          scrollAlign="center"
          className="-mx-3"
          contentContainerClassName="gutters px-safe-offset-gx"
        >
          <Tabs.Indicator />
          {routes.map((r) => (
            <Tabs.Trigger
              key={r.key}
              value={r.key}
              className="rounded-full"
              asChild
            >
              <PressableFeedback>
                <Tabs.Label>
                  {r.title}
                  {/* fixed width, so a changing count never resizes the trigger and re-renders every tab */}
                  <View className="w-9 items-end">
                    <Memo>
                      {() => (
                        <Badge>
                          {counts$[r.key as MediaListStatus].get() ?? "~"}
                        </Badge>
                      )}
                    </Memo>
                  </View>
                </Tabs.Label>
                <PressableFeedback.Highlight />
              </PressableFeedback>
            </Tabs.Trigger>
          ))}
        </Tabs.ScrollView>
      </Tabs.List>
    </Tabs>
  );
}
