import {
  HStack,
  Picker,
  Section,
  Spacer,
  Toggle,
  VStack,
} from "@expo/ui/swift-ui";
import {
  fixedSize,
  foregroundStyle,
  labelsHidden,
  onTapGesture,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { Computed, useValue } from "@legendapp/state/react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import {
  DESCRIPTIONS,
  LIST_REFRESH_OPTIONS,
} from "@/features/settings/constants";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";

const refresh$ = settings$.mangaList.refresh;

export function ListRefreshSection() {
  const primary = useThemeColor("primary");
  const rowBackground = useRowBackground();
  const onOpen = useValue(refresh$.onOpen);

  return (
    <Section modifiers={[rowBackground]} header={<Text>AniList list</Text>}>
      <Toggle
        isOn={onOpen}
        onIsOnChange={(on) => refresh$.onOpen.set(on)}
        modifiers={[
          ...ROW_FILL,
          onTapGesture(() => refresh$.onOpen.set((on) => !on)),
        ]}
      >
        <Text>Refresh on open</Text>
        <Text
          textStyle="subheadline"
          modifiers={[foregroundStyle("secondary")]}
        >
          {DESCRIPTIONS.listRefreshOnOpen}
        </Text>
      </Toggle>
      {onOpen ? (
        // With a two-line label, a menu Picker drops its value below it.
        <HStack>
          <VStack alignment="leading">
            <Text>Refresh after</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {DESCRIPTIONS.listRefreshAfter}
            </Text>
          </VStack>
          <Spacer />
          <Computed>
            {() => (
              <Picker
                key={primary}
                label={<Text>Refresh after</Text>}
                selection={refresh$.minutes.get()}
                onSelectionChange={(minutes: number | null) =>
                  minutes !== null && refresh$.minutes.set(minutes)
                }
                modifiers={[labelsHidden(), fixedSize()]}
              >
                {LIST_REFRESH_OPTIONS.map((option) => (
                  <Text key={option.minutes} modifiers={[tag(option.minutes)]}>
                    {option.label}
                  </Text>
                ))}
              </Picker>
            )}
          </Computed>
        </HStack>
      ) : null}
    </Section>
  );
}
