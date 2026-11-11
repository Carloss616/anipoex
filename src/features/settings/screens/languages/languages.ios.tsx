import { List, Section } from "@expo/ui/swift-ui";
import {
  environment,
  listRowBackground,
  listStyle,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { EmptyState } from "@/components/blocks/empty-state";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import {
  languageName,
  languageOrder$,
  useLoadInstalled,
} from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import { moveTo } from "@/utils/move-to";
import { EMPTY, FOOTNOTE } from "./constants";

/** The List stays in edit mode, so every language shows its reorder handle. */
export function Languages() {
  useLoadInstalled();
  const codes = useValue(() => languageOrder$.get().join())
    .split(",")
    .filter(Boolean);
  // The theme's surfaces, not the system's grouped grays.
  const rowBackground = listRowBackground(useThemeColor("surface-secondary"));

  const move = (sources: number[], destination: number) => {
    const from = sources[0];
    if (from === undefined) return;
    const order = languageOrder$.peek();
    // SwiftUI's destination counts the moved row in place.
    const to = destination > from ? destination - 1 : destination;
    settings$.sources.languages.set(moveTo(order, order[from], to));
  };

  if (!codes.length)
    return (
      <>
        <Stack.Title>Languages</Stack.Title>
        <EmptyState {...EMPTY} />
      </>
    );

  return (
    <>
      <Stack.Title>Languages</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
            environment("editMode", "active"),
          ]}
        >
          <Section modifiers={[rowBackground]} footer={<Text>{FOOTNOTE}</Text>}>
            <List.ForEach
              data={codes}
              keyExtractor={(code) => code}
              recycling={false}
              onMove={move}
            >
              {({ item: code }) => <Text>{languageName(code)}</Text>}
            </List.ForEach>
          </Section>
        </List>
      </Host>
    </>
  );
}
