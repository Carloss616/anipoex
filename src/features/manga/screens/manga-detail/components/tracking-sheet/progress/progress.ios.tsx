import { ScrollView, VStack } from "@expo/ui/swift-ui";
import { fixedSize, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { NumberInput } from "@/components/ui/number-input";
import { ChangesPreview } from "../changes-preview";
import { Header } from "../header.ios";
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
      <Header
        title="Progress"
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />

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
    </VStack>
  );
}
