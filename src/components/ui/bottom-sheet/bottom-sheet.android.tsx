import type { SnapPoint } from "@expo/ui";
import {
  ModalBottomSheet,
  type ModalBottomSheetRef,
} from "@expo/ui/jetpack-compose";
import {
  animateContentSize,
  clickable,
  fillMaxHeight,
  fillMaxWidth,
} from "@expo/ui/jetpack-compose/modifiers";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ViewProps } from "react-native";
import { Column } from "@/components/layout/column";
import { dismissFocus } from "@/utils/focus";
import { Host } from "../host";
import type { BottomSheetProps } from "./bottom-sheet";

// M3 `ModalBottomSheet` only has partial/expanded states.
// Only allow the partial state when the consumer requested a partial-friendly snap point.
function shouldSkipPartiallyExpanded(
  snapPoints: SnapPoint[] | undefined,
): boolean {
  if (!snapPoints || snapPoints.length === 0) return false;
  return !snapPoints.some(
    (sp) =>
      sp === "half" ||
      (typeof sp === "object" && "fraction" in sp && sp.fraction < 1) ||
      (typeof sp === "object" && "height" in sp),
  );
}

// M3 sizes content to intrinsic height.
// Apply `fillMaxHeight` so `'full'` actually fills the viewport instead of stopping at content height.
function shouldFillMaxHeight(snapPoints: SnapPoint[] | undefined): boolean {
  if (!snapPoints || snapPoints.length === 0) return false;
  return snapPoints.some(
    (sp) =>
      sp === "full" ||
      (typeof sp === "object" && "fraction" in sp && sp.fraction >= 1),
  );
}

/** While any `LockDrag` is mounted, the sheet can't be dragged. */
const LockDragContext = createContext<(delta: 1 | -1) => void>(() => {});

/** @see `node_modules/@expo/ui/src/universal/BottomSheet/index.android.tsx` */
function BottomSheetRoot({
  children,
  isPresented,
  onDismiss,
  showDragIndicator = true,
  snapPoints,
  testID,
  modifiers,
  containerColor,
  scrimColor,
  alignment,
  className,
}: BottomSheetProps) {
  const sheetRef = useRef<ModalBottomSheetRef>(null);
  const [mount, setMount] = useState(isPresented);
  const [lockCount, setLockCount] = useState(0);
  // Stable, or `LockDrag` would re-count on every render.
  const trackLock = useCallback((delta: 1 | -1) => {
    setLockCount((count) => count + delta);
  }, []);

  useEffect(() => {
    if (isPresented) {
      setMount(true);
      return;
    }
    let cancelled = false;
    sheetRef.current?.hide().then(() => {
      if (!cancelled) setMount(false);
    });
    return () => {
      cancelled = true;
    };
  }, [isPresented]);

  if (!mount) {
    return null;
  }

  return (
    <Host className="absolute" pointerEvents="none">
      <ModalBottomSheet
        ref={sheetRef}
        onDismissRequest={onDismiss}
        showDragHandle={showDragIndicator}
        skipPartiallyExpanded={shouldSkipPartiallyExpanded(snapPoints)}
        sheetGesturesEnabled={lockCount === 0}
        modifiers={modifiers}
        containerColor={containerColor}
        scrimColor={scrimColor}
      >
        <Column
          testID={testID}
          alignment={alignment}
          className={className}
          modifiers={[
            clickable(dismissFocus, { indication: false }),
            fillMaxWidth(),
            animateContentSize(),
            ...(shouldFillMaxHeight(snapPoints) ? [fillMaxHeight()] : []),
          ]}
        >
          <LockDragContext.Provider value={trackLock}>
            {children}
          </LockDragContext.Provider>
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}

/**
 * Wraps a control the sheet must not drag from, like a slider thumb: M3 drags
 * from anywhere inside it. Turns the sheet's drag off while mounted — the scrim
 * and back still dismiss it. Inert outside a sheet.
 */
function LockDrag({ children }: ViewProps) {
  const trackLock = useContext(LockDragContext);

  useEffect(() => {
    trackLock(1);
    return () => trackLock(-1);
  }, [trackLock]);

  return children;
}

export const BottomSheet = Object.assign(BottomSheetRoot, { LockDrag });
