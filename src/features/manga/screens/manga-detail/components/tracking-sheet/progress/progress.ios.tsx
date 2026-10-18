import { ScrollView, VStack } from "@expo/ui/swift-ui";
import { fixedSize, lineLimit, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/swift-ui/text";
import { NumberInput } from "@/components/ui/number-input";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useProgress } from "./hooks/use-progress";
import type { ProgressProps } from "./progress";

export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { isLandscape } = useBreakpoint();
  const { value, step, next, dirty, changes } = useProgress(form, total);

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
        Progress
      </Text>

      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack modifiers={[padding({ all: 16 })]}>
          <NumberInput
            suffix={total ? `/${total}` : undefined}
            value={value}
            min={0}
            max={total ?? Number.MAX_SAFE_INTEGER}
            step={1}
            size="lg"
            onValueChange={step}
          />
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
