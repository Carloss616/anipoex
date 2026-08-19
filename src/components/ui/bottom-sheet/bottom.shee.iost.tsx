import type { SnapPoint } from "@expo/ui";
import { Group, BottomSheet as SwiftUIBottomSheet } from "@expo/ui/swift-ui";
import {
  frame,
  type ModifierConfig,
  type PresentationDetent,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { Column } from "@/components/layout/column";
import { Host } from "../host";
import type { BottomSheetProps } from "./bottom.sheet";

function snapPointToDetent(snapPoint: SnapPoint): PresentationDetent {
  if (snapPoint === "half") return "medium";
  if (snapPoint === "full") return "large";
  return snapPoint;
}

/** @see `node_modules/@expo/ui/src/universal/BottomSheet/index.ios.tsx` */
export function BottomSheet({
  children,
  isPresented,
  onDismiss,
  showDragIndicator = true,
  snapPoints,
  testID,
  modifiers,
  alignment,
  className,
}: BottomSheetProps) {
  const presentationModifiers: ModifierConfig[] = [
    frame({ maxWidth: Infinity, alignment: "topLeading" }),
    presentationDragIndicator(showDragIndicator ? "visible" : "hidden"),
  ];
  if (snapPoints && snapPoints.length > 0) {
    presentationModifiers.push(
      presentationDetents(snapPoints.map(snapPointToDetent)),
    );
  }
  if (modifiers?.length) {
    presentationModifiers.push(...modifiers);
  }

  return (
    <Host className="absolute" pointerEvents="none">
      <SwiftUIBottomSheet
        isPresented={isPresented}
        onIsPresentedChange={(presented) => {
          if (!presented) onDismiss();
        }}
        fitToContents={!snapPoints || snapPoints.length === 0}
        testID={testID}
      >
        <Group modifiers={presentationModifiers}>
          <Column alignment={alignment} className={className}>
            {children}
          </Column>
        </Group>
      </SwiftUIBottomSheet>
    </Host>
  );
}
