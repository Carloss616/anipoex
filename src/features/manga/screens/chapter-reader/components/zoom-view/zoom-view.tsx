import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Platform,
  type ScrollView,
  type ScrollViewProps,
  View,
} from "react-native";
import {
  GestureDetector,
  ScrollView as GestureScrollView,
  useCompetingGestures,
  usePanGesture,
  usePinchGesture,
} from "react-native-gesture-handler";
import Animated, {
  type AnimatedRef,
  cancelAnimation,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
  useSharedValue,
  withDecay,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import type { LegendListRef } from "@/components/layout/legend-list";
import { useTrackpad } from "./hooks/use-trackpad";
import { scrollList } from "./utils/scroll-list";
import {
  clamp,
  type PinchAnchor,
  pinchAnchor,
  pinchTo,
  type Zoom,
} from "./utils/zoom";

// Android: a plain ScrollView claims two moving fingers before the pinch
// activates, and the system cancels the pinch. In the gesture handler's
// ScrollView, made interruptible, the pinch takes the touch over instead.
// The web list is plain divs.
const renderScrollComponent =
  Platform.OS === "web"
    ? undefined
    : (props: ScrollViewProps) => (
        <GestureScrollView {...props} disallowInterruption={false} />
      );

export interface ZoomViewProps {
  /** The list inside, for how far it scrolls. */
  listRef: RefObject<LegendListRef | null>;
  children: (list: {
    /** The list's `refScrollView`: the zoom reads and moves its scroll on the UI thread. */
    refScrollView: AnimatedRef<ScrollView>;
    /** The list's `renderScrollComponent`. */
    renderScrollComponent: typeof renderScrollComponent;
    /** Space under the list's footer, so its end reaches the screen's bottom at this zoom. */
    bottomSpace: number;
  }) => ReactNode;
}

/**
 * Pinch (touch or trackpad) zooms the list from 1x to 3x, as a transform only:
 * nothing is laid out again, so letting go changes nothing on screen. Zoomed,
 * one finger (or a two-finger scroll) slides it sideways; down, the list
 * keeps scrolling natively.
 */
export function ZoomView({ listRef, children }: ZoomViewProps) {
  const node = useRef<View>(null);
  const scrollRef = useAnimatedRef<ScrollView>();
  const scroll = useScrollOffset(scrollRef);
  // Shared values go through get/set: the React Compiler takes a `.value`
  // in a closure for a render dependency and reads it while rendering.
  const size = useSharedValue({ width: 0, height: 0 });
  const maxScroll = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const anchor = useSharedValue<PinchAnchor>({ scale: 1, x: 0, y: 0 });
  const fingers = useSharedValue(0);
  const trackpadFocal = useRef({ x: 0, y: 0 });
  const [bottomSpace, setBottomSpace] = useState(0);

  useEffect(() => {
    const state = listRef.current?.getState();
    if (!state) return;
    const update = () => {
      const current = listRef.current?.getState();
      if (current)
        maxScroll.set(
          Math.max(0, current.contentLength - current.scrollLength),
        );
    };
    update();
    const unlisten = (["totalSize", "footerSize"] as const).map((type) =>
      state.listen(type, update),
    );
    return () => {
      for (const off of unlisten) off();
    };
  }, [listRef, maxScroll]);

  const start = (x: number, y: number) => {
    "worklet";
    cancelAnimation(translateX);
    anchor.set(
      pinchAnchor(
        {
          scale: scale.get(),
          translateX: translateX.get(),
          scroll: scroll.get(),
        },
        x,
        y,
      ),
    );
  };
  const apply = (zoom: Zoom) => {
    "worklet";
    scale.set(zoom.scale);
    translateX.set(zoom.translateX);
    scrollList(scrollRef, zoom.scroll);
  };
  const update = (factor: number, x: number, y: number) => {
    "worklet";
    apply(
      pinchTo(anchor.get(), {
        factor,
        focalX: x,
        focalY: y,
        width: size.get().width,
        maxScroll: maxScroll.get(),
      }),
    );
  };
  // Only the space under the footer waits for the pinch to end: it moves nothing above it.
  const end = () => {
    "worklet";
    scheduleOnRN(setBottomSpace, size.get().height * (1 - 1 / scale.get()));
  };
  const minX = () => {
    "worklet";
    return (1 - scale.get()) * size.get().width;
  };

  const pinch = usePinchGesture({
    onTouchesDown: (event) => {
      fingers.set(event.numberOfTouches);
    },
    onTouchesUp: (event) => {
      fingers.set(event.numberOfTouches);
    },
    onActivate: (event) => {
      start(event.focalX, event.focalY);
    },
    onUpdate: (event) => {
      // Android sends one more update as a finger lifts, its focal point on the finger left.
      if (fingers.get() < 2) return;
      update(event.scale, event.focalX, event.focalY);
    },
    onDeactivate: () => {
      end();
    },
  });

  const pan = usePanGesture({
    // Off at 1x, where nothing moves sideways.
    enabled: bottomSpace > 0,
    // Sideways only: a vertical drag stays the list's own scroll.
    activeOffsetX: [-10, 10],
    failOffsetY: [-5, 5],
    onActivate: () => {
      cancelAnimation(translateX);
    },
    onUpdate: (event) => {
      translateX.set(clamp(translateX.get() + event.changeX, minX(), 0));
    },
    onDeactivate: (event) => {
      translateX.set(
        withDecay({ velocity: event.velocityX, clamp: [minX(), 0] }),
      );
    },
  });

  const gesture = useCompetingGestures(pinch, pan);

  useTrackpad(node, {
    onPinchStart: (x, y) => {
      trackpadFocal.current = { x, y };
      start(x, y);
    },
    onPinch: (factor) =>
      update(factor, trackpadFocal.current.x, trackpadFocal.current.y),
    onPinchEnd: end,
    onScroll: (dx, dy) => {
      if (scale.get() <= 1) return false;
      translateX.set(clamp(translateX.get() - dx, minX(), 0));
      // Unscaled, the list would move as many screen pixels as the zoom times the fingers.
      scrollList(
        scrollRef,
        clamp(scroll.get() + dy / scale.get(), 0, maxScroll.get()),
      );
      return true;
    },
  });

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.get() }, { scale: scale.get() }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        ref={node}
        style={{ flex: 1, overflow: "hidden" }}
        onLayout={({ nativeEvent }) => {
          size.set(nativeEvent.layout);
          // A narrower view (a rotation, a resized window) keeps the zoom over the screen.
          translateX.set(
            clamp(
              translateX.get(),
              (1 - scale.get()) * nativeEvent.layout.width,
              0,
            ),
          );
        }}
      >
        <Animated.View
          style={[{ flex: 1, transformOrigin: "left top" }, zoomStyle]}
        >
          {children({
            refScrollView: scrollRef,
            renderScrollComponent,
            bottomSpace,
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
