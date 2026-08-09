import {
  type MaterialColors,
  useMaterialColors,
} from "@expo/ui/jetpack-compose";
import { useThemeColor } from "heroui-native/hooks";
import { Tabs, useTabsTrigger } from "heroui-native/tabs";
import { type TouchableNativeFeedbackProps, View } from "react-native";
import type { Route } from "react-native-tab-view";
import { TouchableNativeFeedback } from "@/components/ui/touchable-native-feedback";
import type { TabBarProps } from "./tab-bar";

export function TabBar<T extends Route>({
  navigationState: { index, routes },
  jumpTo,
}: TabBarProps<T>) {
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
              <TabTrigger m3={m3}>{r.title}</TabTrigger>
            </Tabs.Trigger>
          ))}
        </Tabs.ScrollView>
      </Tabs.List>
    </Tabs>
  );
}

function TabTrigger({
  m3,
  style,
  className,
  children,
  ...props
}: TouchableNativeFeedbackProps & { m3: MaterialColors }) {
  const { isSelected } = useTabsTrigger();

  return (
    <TouchableNativeFeedback {...props}>
      <View className={className} style={style}>
        <Tabs.Label
          style={{
            color: isSelected ? m3.primary : m3.onSurfaceVariant,
          }}
        >
          {children}
        </Tabs.Label>
      </View>
    </TouchableNativeFeedback>
  );
}
