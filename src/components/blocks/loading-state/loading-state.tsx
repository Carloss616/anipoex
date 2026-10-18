import { View } from "react-native";
import { Loader, type LoaderProps } from "@/components/ui/loader";

export interface LoadingStateProps {
  /** @default "morph-ring" */
  variant?: LoaderProps["variant"];
}

/** A large loader centred in what it's given, while a screen's data loads. */
export function LoadingState({ variant = "morph-ring" }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center">
      <Loader variant={variant} speed={3} size="lg" />
    </View>
  );
}
