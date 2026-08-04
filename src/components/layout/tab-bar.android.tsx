import {
  type MaterialColors,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { useThemeColor } from "heroui-native/hooks";
import { Tabs, useTabsTrigger } from "heroui-native/tabs";
import type {
  NavigationState,
  Route,
  SceneRendererProps,
} from "react-native-tab-view";
import { PressableFeedback } from "../ui/pressable-feedback";

export function TabBar<T extends Route>({
  navigationState: { index, routes },
  jumpTo,
}: SceneRendererProps & { navigationState: NavigationState<T> }) {
  const accent = useThemeColor("accent");
  const m3 = useMaterialColors({ seedColor: accent });

  return (
    <Tabs value={routes[index].key} onValueChange={jumpTo} variant="secondary">
      <Tabs.List
        className="w-full"
        style={{ backgroundColor: m3.surface, borderColor: m3.outlineVariant }}
      >
        <Tabs.ScrollView
          scrollAlign="center"
          className="-mx-3"
          contentContainerClassName="gutters px-safe-offset-gx"
        >
          <Tabs.Indicator style={{ borderColor: m3.primary }} />
          {routes.map((r) => (
            <Tabs.Trigger key={r.key} value={r.key} asChild>
              <PressableFeedback>
                <TabLabel m3={m3}>{r.title}</TabLabel>
              </PressableFeedback>
            </Tabs.Trigger>
          ))}
        </Tabs.ScrollView>
      </Tabs.List>
    </Tabs>
  );
}

function TabLabel({
  m3,
  children,
}: React.PropsWithChildren<{ m3: MaterialColors }>) {
  const { isSelected } = useTabsTrigger();

  return (
    <Tabs.Label
      style={{
        color: isSelected ? m3.onSurface : m3.onSurfaceVariant,
      }}
    >
      {children}
    </Tabs.Label>
  );
}
