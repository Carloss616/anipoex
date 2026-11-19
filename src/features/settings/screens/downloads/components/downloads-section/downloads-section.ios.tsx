import {
  Button,
  HStack,
  Picker,
  Section,
  Spacer,
  VStack,
} from "@expo/ui/swift-ui";
import {
  fixedSize,
  foregroundStyle,
  labelsHidden,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useReducer } from "react";
import { ROW_FILL } from "@/components/native/swift-ui/constants";
import { Text } from "@/components/native/swift-ui/text";
import { useRowBackground } from "@/features/settings/hooks/use-row-background";
import { useThemeColor } from "@/hooks/use-theme-color";
import { DOWNLOADS_FOOTER, SAVE_TO_OPTIONS } from "./constants";
import { useDownloadsSection } from "./hooks/use-downloads-section";
import type { SaveTo } from "./utils";

export function DownloadsSection() {
  const downloads = useDownloadsSection();
  const primary = useThemeColor("primary");
  const rowBackground = useRowBackground();
  // The picker keeps its own selection: a dismissed folder picker remounts it.
  const [revision, remount] = useReducer((n: number) => n + 1, 0);

  return (
    <Section
      modifiers={[rowBackground]}
      footer={<Text>{DOWNLOADS_FOOTER}</Text>}
    >
      <HStack>
        <VStack alignment="leading">
          <Text>Save to</Text>
          {downloads.note ? (
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary")]}
            >
              {downloads.note}
            </Text>
          ) : null}
        </VStack>
        <Spacer />
        <Picker
          key={`${primary}:${revision}`}
          label={<Text>Save to</Text>}
          selection={downloads.saveTo}
          onSelectionChange={(option: SaveTo | null) => {
            if (option)
              void downloads.setSaveTo(option).then((saved) => {
                if (!saved) remount();
              });
          }}
          modifiers={[labelsHidden(), fixedSize()]}
        >
          {SAVE_TO_OPTIONS.map((option) => (
            <Text key={option.id} modifiers={[tag(option.id)]}>
              {option.label}
            </Text>
          ))}
        </Picker>
      </HStack>
      {downloads.folder ? (
        <Button onPress={downloads.folder.change}>
          <HStack spacing={8} modifiers={ROW_FILL}>
            <Text modifiers={[foregroundStyle("primary")]}>
              {downloads.folder.name}
            </Text>
            <Spacer />
            <Text modifiers={[foregroundStyle(primary)]}>Change</Text>
          </HStack>
        </Button>
      ) : null}
    </Section>
  );
}
