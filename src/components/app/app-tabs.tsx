import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native/hooks";

export function AppTabs() {
  const [accentSoftForeground, accentSoft, accent, surfaceSecondary, muted] =
    useThemeColor([
      "accent-soft-foreground",
      "accent-soft",
      "accent",
      "background-secondary",
      "muted",
    ]);

  return (
    <NativeTabs
      tintColor={accent}
      backgroundColor={surfaceSecondary}
      indicatorColor={accentSoft}
      rippleColor={accentSoft}
      labelStyle={{
        default: { color: muted },
        selected: { color: accentSoftForeground },
      }}
      iconColor={{ default: muted, selected: accentSoftForeground }}
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "house",
            selected: "house.fill",
          }}
          md={{
            default: "home",
            selected: "in_home_mode",
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="manga">
        <NativeTabs.Trigger.Label>Manga</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "book",
            selected: "book.fill",
          }}
          md={{
            default: "book_2",
            selected: "book_5",
          }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
