import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
} from "@expo/ui/jetpack-compose/modifiers";
import { Text } from "@/components/native/jetpack-compose/text";
import { NumberInput } from "@/components/ui/number-input";
import { ChangesPreview } from "../changes-preview";
import { Footer } from "../footer";
import { useProgress } from "./hooks/use-progress";
import type { ProgressProps } from "./progress";

export function Progress({ form, total, onCancel, onConfirm }: ProgressProps) {
  const { value, step, next, dirty, changes } = useProgress(form, total);

  return (
    // The whole view scrolls: in landscape the keyboard leaves no room
    // for a pinned title and footer around the field.
    <Column modifiers={[verticalScroll(), padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        Progress
      </Text>

      <Column modifiers={[fillMaxWidth(), padding(16, 16, 16, 16)]}>
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
