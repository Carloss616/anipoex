import type { SnapPoint } from "@expo/ui";
import {
  ModalBottomSheet,
  type ModalBottomSheetRef,
} from "@expo/ui/jetpack-compose";
import {
  fillMaxHeight,
  fillMaxWidth,
} from "@expo/ui/jetpack-compose/modifiers";
import { useEffect, useRef, useState } from "react";
import { Column } from "@/components/layout/column";
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

/** @see `node_modules/@expo/ui/src/universal/BottomSheet/index.android.tsx` */
export function BottomSheet({
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
        modifiers={modifiers}
        containerColor={containerColor}
        scrimColor={scrimColor}
      >
        <Column
          testID={testID}
          alignment={alignment}
          className={className}
          modifiers={[
            fillMaxWidth(),
            ...(shouldFillMaxHeight(snapPoints) ? [fillMaxHeight()] : []),
          ]}
        >
          {children}
        </Column>
      </ModalBottomSheet>
    </Host>
  );
}
