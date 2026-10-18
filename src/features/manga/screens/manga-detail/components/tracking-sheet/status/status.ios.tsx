import { ScrollView, VStack } from "@expo/ui/swift-ui";
import { fixedSize, lineLimit, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { RadioGroup } from "@/components/ui/radio-group";
import { MANGA_STATUS_ENTRIES } from "@/features/manga/constants";
import type { MediaListStatus } from "@/graphql/types.generated";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import type { StatusProps } from "./status";
import { useStatus } from "./use-status";

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
          <RadioGroup
            value={selected}
            onValueChange={(value) => setSelected(value as MediaListStatus)}
          >
            {MANGA_STATUS_ENTRIES.map(([status, title]) => (
              <RadioGroup.Item key={status} value={status} label={title} />
            ))}
          </RadioGroup>
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
