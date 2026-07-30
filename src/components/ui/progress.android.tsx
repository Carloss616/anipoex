import { LinearWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { Host, useIsInsideHost } from "./host";
import type { ProgressProps } from "./progress";

export function Progress({ value, testID }: ProgressProps) {
  const isInsideHost = useIsInsideHost();

  const progress = (
    <LinearWavyProgressIndicator
      progress={value}
      modifiers={[fillMaxWidth(), ...(testID ? [testIDModifier(testID)] : [])]}
    />
  );

  return isInsideHost ? progress : <Host matchContents>{progress}</Host>;
}
