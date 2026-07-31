import { LinearWavyProgressIndicator } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  height as heightModifier,
  testID as testIDModifier,
} from "@expo/ui/jetpack-compose/modifiers";
import { StyleSheet } from "react-native";
import { withUniwind } from "uniwind";
import { dp } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";
import type { ProgressProps } from "./progress";

function ProgressBase({ value, style, testID }: ProgressProps) {
  const isInsideHost = useIsInsideHost();
  const height = dp(StyleSheet.flatten(style)?.height);

  const progress = (
    <LinearWavyProgressIndicator
      progress={value}
      modifiers={[
        fillMaxWidth(),
        ...(height ? [heightModifier(height)] : []),
        ...(testID ? [testIDModifier(testID)] : []),
      ]}
    />
  );

  return isInsideHost ? progress : <Host matchContents>{progress}</Host>;
}

export const Progress = withUniwind(ProgressBase);
