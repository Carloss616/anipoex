import { Picker, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  fixedSize,
  labelsHidden,
  lineLimit,
  padding,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useStatus } from "./hooks/use-status";
import type { StatusProps } from "./status";

export function Status({ form, total, onCancel, onConfirm }: StatusProps) {
  const { isLandscape } = useBreakpoint();
  const { selected, setSelected, next, dirty, changes } = useStatus(
    form,
    total,
  );

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <Text
        textStyle="title3"
        modifiers={[lineLimit(1), padding({ horizontal: 16 })]}
      >
        Status
      </Text>

      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack modifiers={[padding({ all: 16 })]}>
          {/* A wheel is iOS's own single choice; the rows are tagged Texts. */}
          <Picker
            selection={selected ?? null}
            onSelectionChange={(value) => {
              if (typeof value === "string")
                setSelected(value as MediaListStatus);
            }}
            modifiers={[pickerStyle("wheel"), labelsHidden()]}
          >
            {MANGA_STATUS_ENTRIES.map(([status, title]) => (
              <Text key={status} modifiers={[tag(status)]}>
                {title}
              </Text>
            ))}
          </Picker>
        </VStack>
      </ScrollView>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </VStack>
  );
}
