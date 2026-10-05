import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ProtoPickerProps {
  variants: string[];
  index: number;
  onChange: (index: number) => void;
  onReplay: () => void;
  showReplay?: boolean;
}

/**
 * Verbatim picker chrome from prototype/PICKER.md — values are not a design
 * decision and must not adopt project tokens.
 */
export function ProtoPicker({
  variants,
  index,
  onChange,
  onReplay,
  showReplay = true,
}: ProtoPickerProps) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const ready = useSharedValue(0);
  const highlightX = useSharedValue(0);
  const highlightW = useSharedValue(0);
  const itemLayouts = useRef<{ x: number; width: number }[]>([]);

  const moveHighlight = useCallback(
    (i: number, animate: boolean) => {
      const layout = itemLayouts.current[i];
      if (!layout) return;
      if (!animate || reducedMotion || ready.value === 0) {
        highlightX.value = layout.x;
        highlightW.value = layout.width;
        return;
      }
      highlightX.value = withTiming(layout.x, { duration: 250 });
      highlightW.value = withTiming(layout.width, { duration: 250 });
    },
    [highlightW, highlightX, ready, reducedMotion],
  );

  useLayoutEffect(() => {
    moveHighlight(index, true);
  }, [index, moveHighlight]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ready.value = 1;
      });
    });
    return () => cancelAnimationFrame(id);
  }, [ready]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= variants.length) onChange(num - 1);
      else if (e.key === "ArrowRight") onChange((index + 1) % variants.length);
      else if (e.key === "ArrowLeft")
        onChange((index - 1 + variants.length) % variants.length);
      else if (e.key === "r" || e.key === "R") onReplay();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onChange, onReplay, variants.length]);

  const highlightStyle = useAnimatedStyle(() => ({
    width: highlightW.value,
    transform: [{ translateX: highlightX.value }],
    opacity: highlightW.value > 0 ? 1 : 0,
  }));

  const onItemLayout = (i: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    itemLayouts.current[i] = { x, width };
    if (i === index) moveHighlight(i, false);
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.dock, { paddingBottom: Math.max(24, insets.bottom + 8) }]}
    >
      <View
        accessibilityLabel="Prototype variants"
        accessibilityRole="tablist"
        style={styles.picker}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.highlight, highlightStyle]}
        />
        {variants.map((name, i) => {
          const active = i === index;
          return (
            <Pressable
              key={name}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onLayout={onItemLayout(i)}
              onPress={() => onChange(i)}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
            >
              <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {name}
              </Text>
            </Pressable>
          );
        })}
        {showReplay ? (
          <>
            <View style={styles.divider} />
            <Pressable
              accessibilityLabel="Replay animation (R)"
              onPress={onReplay}
              style={({ pressed }) => [
                styles.item,
                styles.replay,
                pressed && styles.itemPressed,
              ]}
            >
              <Text style={styles.itemText}>↻</Text>
            </Pressable>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2147483647,
    alignItems: "center",
  },
  picker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    padding: 4,
    borderRadius: 999,
    backgroundColor: "rgba(10, 10, 10, 0.82)",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  highlight: {
    position: "absolute",
    top: 4,
    left: 0,
    height: 28,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  item: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  itemPressed: {
    transform: [{ scale: 0.97 }],
  },
  itemText: {
    fontSize: 13,
    lineHeight: 16,
    color: "rgba(255, 255, 255, 0.55)",
  },
  itemTextActive: {
    color: "#fff",
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: 4,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  replay: {
    paddingHorizontal: 10,
  },
});
