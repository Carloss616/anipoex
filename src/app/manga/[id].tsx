import { Icon } from "@expo/ui";
import { Stack } from "expo-router";
import { MangaDetail } from "@/features/manga/screens/manga-detail";

export default function MangaEntryScreen() {
  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu
          icon={Icon.select({
            ios: "ellipsis",
            android: import("@expo/material-symbols/more_vert.xml"),
          })}
        >
          <Stack.Toolbar.MenuAction
            icon={Icon.select({
              ios: "square.and.arrow.up",
              android: import("@expo/material-symbols/share.xml"),
            })}
          >
            Share
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon={Icon.select({
              ios: "arrow.down.circle",
              android: import("@expo/material-symbols/download.xml"),
            })}
          >
            Download
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <MangaDetail />
    </>
  );
}
