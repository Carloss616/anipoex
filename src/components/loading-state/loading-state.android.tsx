import { Box } from "@expo/ui/jetpack-compose";
import { fillMaxSize } from "@expo/ui/jetpack-compose/modifiers";
import { EnsureHost } from "@/components/ui/host";
import { Loader } from "@/components/ui/loader";
import type { LoadingStateProps } from "./loading-state";

export function LoadingState({ variant = "morph-ring" }: LoadingStateProps) {
  return (
    <EnsureHost className="flex-1">
      <Box contentAlignment="center" modifiers={[fillMaxSize()]}>
        <Loader variant={variant} speed={3} size="lg" />
      </Box>
    </EnsureHost>
  );
}
