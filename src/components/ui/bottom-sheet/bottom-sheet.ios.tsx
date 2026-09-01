import type { SnapPoint } from "@expo/ui";
import { Group, BottomSheet as SwiftUIBottomSheet } from "@expo/ui/swift-ui";
import {
  type PresentationDetent,
  padding,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import type { ViewProps } from "react-native";
import { Column } from "@/components/layout/column";
import { Host } from "../host";
import type { BottomSheetProps } from "./bottom-sheet";

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
  containerColor,
  alignment,
  className,
}: BottomSheetProps) {
  return (
    <Host className="absolute" pointerEvents="none">
      <SwiftUIBottomSheet
        isPresented={isPresented}
        onIsPresentedChange={(presented) => {
          if (!presented) onDismiss();
        }}
        fitToContents={!snapPoints?.length}
        testID={testID}
      >
        <Group
          modifiers={[
            presentationDragIndicator(showDragIndicator ? "visible" : "hidden"),
            ...(typeof containerColor === "string"
              ? [presentationBackground(containerColor)]
              : []),
            ...(showDragIndicator ? [padding({ top: 10 })] : []),
            ...(snapPoints?.length
              ? [presentationDetents(snapPoints.map(snapPointToDetent))]
              : []),
            ...(modifiers ?? []),
          ]}
        >
          <Column alignment={alignment} className={className}>
            {children}
          </Column>
        </Group>
      </SwiftUIBottomSheet>
    </Host>
  );
}

export const NoDragView = ({ children }: ViewProps) => children;
