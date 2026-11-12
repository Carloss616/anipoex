import {
  Button,
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
import { Computed, Memo } from "@legendapp/state/react";
import { useRouter } from "expo-router";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import { languageName, languageOrder$ } from "@/features/extensions";
import { useThemeColor } from "@/hooks/use-theme-color";
import { settings$ } from "@/state/settings";
import { DESCRIPTIONS, SLOW_SKIP_OPTIONS } from "../../constants";
import { useRowBackground } from "../../hooks/use-row-background";

export function SourcesSection() {
  const router = useRouter();
  const primary = useThemeColor("primary");
  const rowBackground = useRowBackground();

  return (
    <Section modifiers={[rowBackground]} title="Sources">
      <Memo>
        {() => (
          <Toggle
            isOn={settings$.sources.autoPick.get()}
            onIsOnChange={(on) => settings$.sources.autoPick.set(on)}
            modifiers={[
              ...ROW_FILL,
              onTapGesture(() => settings$.sources.autoPick.set((on) => !on)),
            ]}
          >
            <Text>Auto-pick a source</Text>
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {DESCRIPTIONS.autoPick}
            </Text>
          </Toggle>
        )}
      </Memo>
      {/* With a two-line label, a menu Picker drops its value below it. */}
      <HStack>
        <VStack alignment="leading">
          <Text>Skip slow sources</Text>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary")]}
          >
            {DESCRIPTIONS.slowSkip}
          </Text>
        </VStack>
        <Spacer />
        <Computed>
          {() => (
            <Picker
              key={primary}
              label={<Text>Skip slow sources</Text>}
              selection={settings$.sources.slowSkip.get()}
              onSelectionChange={(seconds: number | null) =>
                seconds !== null && settings$.sources.slowSkip.set(seconds)
              }
              modifiers={[labelsHidden(), fixedSize()]}
            >
              {SLOW_SKIP_OPTIONS.map((option) => (
                <Text key={option.seconds} modifiers={[tag(option.seconds)]}>
                  {option.label}
                </Text>
              ))}
            </Picker>
          )}
        </Computed>
      </HStack>
      <Button onPress={() => router.push("/settings/languages")}>
        <HStack spacing={8} modifiers={ROW_FILL}>
          <Text modifiers={[foregroundStyle("primary")]}>Languages</Text>
          <Spacer />
          <Memo>
            {() => (
              <Text modifiers={[foregroundStyle("secondary")]}>
                {languageOrder$.get().map(languageName).join(", ")}
              </Text>
            )}
          </Memo>
          <Icon name={Icons.chevronRight} size={13} muted />
        </HStack>
      </Button>
    </Section>
  );
}
