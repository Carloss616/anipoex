import { ProgressView } from "@expo/ui/swift-ui";
import { progressViewStyle } from "@expo/ui/swift-ui/modifiers";
import { Host, useIsInsideHost } from "./host";
import type { ProgressProps } from "./progress";

export function Progress({ value, testID }: ProgressProps) {
  const isInsideHost = useIsInsideHost();

  const progress = (
    <ProgressView
      value={value}
      modifiers={[progressViewStyle("linear")]}
      testID={testID}
    />
  );

  return isInsideHost ? progress : <Host className="w-full">{progress}</Host>;
}
