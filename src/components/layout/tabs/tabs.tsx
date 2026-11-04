import { useValue } from "@legendapp/state/react";
import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";
import { ContinueAccessory } from "@/features/manga/components/continue-accessory";
import { HAS_ACCESSORY } from "@/features/manga/components/continue-accessory/constants";
import { openViewSheet } from "@/features/manga/screens/manga-list/components/view-sheet";
import { continueReading$ } from "@/features/manga/state/continue-reading";
import { useNativeTabsTheme } from "@/hooks/use-theme";

export function Tabs() {
  const tabTheme = useNativeTabsTheme();
  const pathname = usePathname();
  const continuing = useValue(() => !!continueReading$.get());

  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      sidebarAdaptable
      hidden={
        Platform.OS === "android"
          ? /^\/manga\/[^/]+(\/reader)?$/.test(pathname)
          : pathname.endsWith("/reader")
      }
      {...tabTheme}
    >
      {HAS_ACCESSORY && continuing && (
        <NativeTabs.BottomAccessory>
          <ContinueAccessory />
        </NativeTabs.BottomAccessory>
      )}
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

      <NativeTabs.Trigger
        name="manga"
        listeners={{
          tabPress: () => {
            if (Platform.OS === "android" && pathname === "/manga") {
              openViewSheet();
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
    </NativeTabs>
  );
}
