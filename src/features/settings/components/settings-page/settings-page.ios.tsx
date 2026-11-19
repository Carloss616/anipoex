import { List } from "@expo/ui/swift-ui";
import {
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { Stack } from "expo-router";
import { useFont } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import type { SettingsPageProps } from "./settings-page";

export function SettingsPage({ title, children, overlays }: SettingsPageProps) {
  return (
    <>
      <Stack.Title>{title}</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
            useFont(),
          ]}
        >
          {children}
        </List>
        {overlays}
      </Host>
    </>
  );
}
