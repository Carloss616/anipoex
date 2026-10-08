import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";
import { openViewSheet } from "@/features/manga/screens/manga-list/components/view-sheet";
import { useNativeTabsTheme } from "@/hooks/use-theme";

export function Tabs() {
  const tabTheme = useNativeTabsTheme();
  const pathname = usePathname();

  return (
    <NativeTabs minimizeBehavior="onScrollDown" sidebarAdaptable {...tabTheme}>
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
