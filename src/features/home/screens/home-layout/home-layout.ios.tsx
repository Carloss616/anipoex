import { List, Picker, Section, Toggle } from "@expo/ui/swift-ui";
import {
  environment,
  foregroundStyle,
  listRowBackground,
  listStyle,
  pickerStyle,
  scrollContentBackground,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useValue } from "@legendapp/state/react";
import { Stack } from "expo-router";
import { memo } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Host } from "@/components/ui/host";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import {
  ACCOUNT_SECTIONS,
  PRESET_LABELS,
  PRESET_NOTES,
  PRESETS,
  type Preset,
  SECTIONS,
  type SectionId,
} from "../../constants";
import { moved, toggled, withPreset } from "../../utils/home-layout";

/**
 * The List stays in edit mode, so every section shows its reorder handle; a
 * custom layout leaves the picker with no segment selected.
 */
export function HomeLayout() {
  const { preset, order, on } = useValue(settings$.home);
  // The theme's surfaces, not the system's grouped grays.
  const rowBackground = listRowBackground(useThemeColor("muted"));

  const move = (sources: number[], destination: number) => {
    const from = sources[0];
    if (from === undefined) return;
    const layout = settings$.home.peek();
    // SwiftUI's destination counts the moved row in place.
    const to = destination > from ? destination - 1 : destination;
    settings$.home.set(moved(layout, layout.order[from], to));
  };

  return (
    <>
      <Stack.Title>Home layout</Stack.Title>
      <Host className="flex-1">
        <List
          modifiers={[
            listStyle("insetGrouped"),
            scrollContentBackground("hidden"),
            environment("editMode", "active"),
          ]}
        >
          <Section
            modifiers={[rowBackground]}
            title="Preset"
            footer={<Text>{PRESET_NOTES[preset]}</Text>}
          >
            <Picker
              selection={preset}
              onSelectionChange={(next) =>
                next !== "custom" && settings$.home.set(withPreset(next))
              }
              modifiers={[pickerStyle("segmented")]}
            >
              {(Object.keys(PRESETS) as Preset[]).map((key) => (
                <Text key={key} modifiers={[tag(key)]}>
                  {PRESET_LABELS[key]}
                </Text>
              ))}
            </Picker>
          </Section>
          <Section modifiers={[rowBackground]} title="Sections">
            <List.ForEach
              data={order}
              keyExtractor={(id) => id}
              recycling={false}
              onMove={move}
            >
              {({ item: id }) => <SectionRow id={id} on={on.includes(id)} />}
            </List.ForEach>
          </Section>
        </List>
      </Host>
    </>
  );
}

const SectionRow = memo(function SectionRow({
  id,
  on,
}: {
  id: SectionId;
  on: boolean;
}) {
  return (
    <Toggle
      isOn={on}
      onIsOnChange={() =>
        settings$.home.set(toggled(settings$.home.peek(), id))
      }
    >
      <Text>{SECTIONS[id].title}</Text>
      {ACCOUNT_SECTIONS.includes(id) && (
        <Text modifiers={[foregroundStyle("secondary")]}>AniList account</Text>
      )}
    </Toggle>
  );
});
