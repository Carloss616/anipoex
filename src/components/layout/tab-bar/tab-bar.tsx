import { PressableFeedback } from "heroui-native/pressable-feedback";
import { Tabs } from "heroui-native/tabs";
import type {
  NavigationState,
  Route,
  SceneRendererProps,
} from "react-native-tab-view";

export function TabBar<T extends Route>({
  navigationState: { index, routes },
  jumpTo,
}: SceneRendererProps & { navigationState: NavigationState<T> }) {
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
                <Tabs.Label>{r.title}</Tabs.Label>
                <PressableFeedback.Highlight />
              </PressableFeedback>
            </Tabs.Trigger>
          ))}
        </Tabs.ScrollView>
      </Tabs.List>
    </Tabs>
  );
}
