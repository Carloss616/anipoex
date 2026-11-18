import { useValue } from "@legendapp/state/react";
import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";
import { pendingCount } from "@/features/activity/utils/state";
import { ContinueAccessory } from "@/features/manga/components/continue-accessory";
import { HAS_ACCESSORY } from "@/features/manga/components/continue-accessory/constants";
import { openOptionsSheet } from "@/features/manga/screens/manga-list/components/options-sheet";
import { continueReading$ } from "@/features/manga/state/continue-reading";
import { useNativeTabsTheme } from "@/hooks/use-theme";

export function Tabs() {
  const tabTheme = useNativeTabsTheme();
  const pathname = usePathname();
  const continuing = useValue(() => !!continueReading$.get());
  // A string, so Tabs re-renders only when the count changes.
  const pending = useValue(() => String(pendingCount()));

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
      hidden={
        Platform.OS === "android"
          ? // Android hides the bar on any page pushed into Manga or Settings.
            /^\/(manga|settings)\/./.test(pathname)
          : pathname.endsWith("/reader")
      }
      {...tabTheme}
    >
      {HAS_ACCESSORY && continuing && (
        <NativeTabs.BottomAccessory>
          <ContinueAccessory />
        </NativeTabs.BottomAccessory>
      )}
      <NativeTabs.Trigger name="(home)">
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

      <NativeTabs.Trigger
        name="(manga)"
        listeners={{
          tabPress: () => {
            if (Platform.OS === "android" && pathname === "/manga") {
              openOptionsSheet();
            }
          },
        }}
      >
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

      <NativeTabs.Trigger name="extensions">
        <NativeTabs.Trigger.Label>Extensions</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{
            default: "puzzlepiece.extension",
            selected: "puzzlepiece.extension.fill",
          }}
          md={{ default: "extension", selected: "extension" }}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md={{ default: "settings", selected: "settings" }}
          renderingMode="template"
        />
        {/* expo-router drops `hidden` while the badge has text */}
        <NativeTabs.Trigger.Badge hidden={pending === "0"}>
          {pending === "0" ? undefined : pending}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
