import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { Text } from "@/components/native/jetpack-compose/text";
import { NumberInput } from "@/components/ui/number-input";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import type { ProgressProps } from "./progress";
import { useProgress } from "./use-progress";

export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { isLandscape } = useBreakpoint();
  const { value, step, next, dirty, changes } = useProgress(form, total);

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Progress
      </Text>

      <Column
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          padding(16, 16, 16, 16),
        ]}
      >
        <NumberInput
          suffix={total ? `/${total}` : undefined}
          value={value}
          min={0}
          max={total ?? Number.MAX_SAFE_INTEGER}
          step={1}
          size="lg"
          onValueChange={step}
        />
      </Column>

      <ChangesPreview changes={changes} />

      <Footer
        onCancel={onCancel}
        onConfirm={() => onConfirm(next)}
        canConfirm={dirty}
      />
    </Column>
  );
}
