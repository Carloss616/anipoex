import { VStack } from "@expo/ui/swift-ui";
import { frame } from "@expo/ui/swift-ui/modifiers";
import { EnsureHost } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import type { LoadingStateProps } from "./loading-state";

export function LoadingState({ variant = "morph-ring" }: LoadingStateProps) {
  return (
    <EnsureHost className="flex-1">
      <VStack modifiers={[frame({ maxWidth: Infinity, maxHeight: Infinity })]}>
        <Loader variant={variant} speed={3} size="lg" />
      </VStack>
    </EnsureHost>
  );
}
