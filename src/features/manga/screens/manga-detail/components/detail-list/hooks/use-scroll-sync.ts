import {
  createRef,
  type RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import {
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Platform,
  type ScrollViewProps as RNScrollViewProps,
  type ScrollView,
} from "react-native";

const keyStates: Record<
  string,
  {
    states: Array<RefObject<ScrollSyncState>>;
    activeState: RefObject<ScrollSyncState>;
  }
> = {};

type ScrollSyncRef = {
  scrollTo: (offset: number) => void;
};
type ScrollSyncState = {
  lastOffset: number;
  scrollRef: RefObject<ScrollSyncRef | null>;
};
type ScrollSyncProps = Pick<RNScrollViewProps, "horizontal" | "onScroll"> & {
  syncKey?: string;
  syncInterval?: [number, number];
  syncType?: "absolute" | "relative";
};

/** @see https://github.com/martinezguillaume/react-native-scroll-sync/blob/main/src/index.tsx */
export const useScrollSync = ({
  syncKey = "DEFAULT",
  syncInterval = [-Infinity, Infinity],
  syncType = "absolute",
  horizontal = false,
  ...props
}: ScrollSyncProps = {}) => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const stateRef = useRef<ScrollSyncState>({
    lastOffset: 0,
    scrollRef: createRef<ScrollSyncRef>(),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!keyStates[syncKey]) {
      keyStates[syncKey] = {
        activeState: stateRef,
        states: [],
      };
    }
    keyStates[syncKey].states.push(stateRef);
    // syncRef.current?.scrollTo(globalState[syncKey].lastScrollY);

    return () => {
      if (keyStates[syncKey]) {
        keyStates[syncKey].states = keyStates[syncKey].states.filter(
          (state) => state !== stateRef,
        );
      }
    };
  }, [syncKey, syncInterval?.toString()]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const keyState = keyStates[syncKey];
    const contentOffset = horizontal
      ? e.nativeEvent.contentOffset.x
      : e.nativeEvent.contentOffset.y;
    if (stateRef === keyState?.activeState) {
      props.onScroll?.(e);

      let offset: number | null = contentOffset;
      if (
        offset <= syncInterval[0] &&
        !(stateRef.current.lastOffset <= syncInterval[0])
      ) {
        offset = syncInterval[0];
      } else if (
        offset >= syncInterval[1] &&
        !(stateRef.current.lastOffset >= syncInterval[1])
      ) {
        offset = syncInterval[1];
      } else if (offset <= syncInterval[0] || offset >= syncInterval[1]) {
        offset = null;
      }

      keyState.states.forEach((state) => {
        if (state !== stateRef) {
          if (offset !== null) {
            if (syncType === "absolute") {
              state.current?.scrollRef.current?.scrollTo(offset);
            } else {
              const diffOffset = offset - stateRef.current.lastOffset;
              state.current?.scrollRef.current?.scrollTo(
                state.current.lastOffset + diffOffset,
              );
            }
          }
        }
      });
    }
    stateRef.current.lastOffset = contentOffset;
  };

  const setActive = useCallback(() => {
    const keyState = keyStates[syncKey];
    if (keyState) {
      keyState.activeState = stateRef;
    }
  }, [syncKey]);

  // Every render: the sidebar's scroller mounts later when the window widens.
  useEffect(() => {
    if (Platform.OS === "web") {
      const node =
        scrollViewRef?.current?.getScrollableNode() as unknown as HTMLElement;
      node?.addEventListener("wheel", setActive, { passive: true });
      node?.addEventListener("touchstart", setActive, { passive: true });
      return () => {
        node?.removeEventListener("wheel", setActive);
        node?.removeEventListener("touchstart", setActive);
      };
    }
    return;
  });

  useImperativeHandle(stateRef.current.scrollRef, () => ({
    scrollTo(offset) {
      scrollViewRef.current?.scrollTo({
        y: horizontal ? undefined : offset,
        x: horizontal ? offset : undefined,
        animated: false,
      });
    },
  }));

  return {
    ref: scrollViewRef,
    onScroll,
    setActive,
  };
};
