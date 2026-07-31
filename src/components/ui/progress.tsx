import { useThemeColor } from "heroui-native/hooks";
import { cn } from "heroui-native/utils";
import { useEffect } from "react";
import { type StyleProp, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export interface ProgressProps {
  /** Progress from 0 to 1. Omit for an indeterminate bar. */
  value?: number | null;
  className?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function Progress({ value, style, className, testID }: ProgressProps) {
  const accent = useThemeColor("accent");
  const percent = value == null ? null : Math.min(Math.max(value, 0), 1) * 100;

  return (
    <View
      style={style}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-default",
        className,
      )}
      testID={testID}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent ?? undefined}
    >
      {percent === null ? (
        <IndeterminateBar color={accent} />
      ) : (
        <View
          className="h-full rounded-full bg-accent"
          style={{ width: `${percent}%` }}
        />
      )}
    </View>
  );
}

/** No CSS keyframes in RN, so the sweep runs on the UI thread instead. */
function IndeterminateBar({ color }: { color: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
      -1,
      false,
    );
  }, [progress]);

  const sweep = useAnimatedStyle(() => ({
    left: `${progress.value * 140 - 40}%`,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          borderRadius: 999,
          backgroundColor: color,
        },
        sweep,
      ]}
    />
  );
}
