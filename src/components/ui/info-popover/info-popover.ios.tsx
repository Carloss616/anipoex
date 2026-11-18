import { Button, Popover, VStack } from "@expo/ui/swift-ui";
import {
  accessibilityLabel,
  buttonStyle,
  contentShape,
  fixedSize,
  foregroundStyle,
  frame,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { useState } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Icon, Icons } from "@/components/ui/icon";
import type { InfoPopoverProps } from "./info-popover";

const WRAP = [fixedSize({ horizontal: false, vertical: true })];

/** A popover bubble (not a sheet) from an info button in the header. */
export function InfoPopover({
  label,
  title,
  text,
  items,
  note,
}: InfoPopoverProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover isPresented={open} onIsPresentedChange={setOpen} arrowEdge="top">
      <Popover.Trigger>
        <Button
          onPress={() => setOpen(true)}
          modifiers={[buttonStyle("borderless"), accessibilityLabel(label)]}
        >
          {/* A plain glyph only takes taps on its strokes. */}
          <Icon
            name={Icons.info}
            size={17}
            color="inherit"
            modifiers={[
              frame({ width: 30, height: 30 }),
              contentShape(shapes.rectangle()),
            ]}
          />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <VStack
          alignment="leading"
          spacing={8}
          modifiers={[frame({ width: 280, alignment: "leading" }), padding()]}
        >
          {title && (
            <Text weight="semibold" modifiers={WRAP}>
              {title}
            </Text>
          )}
          {text && (
            <Text textStyle="subheadline" modifiers={WRAP}>
              {text}
            </Text>
          )}
          {items && (
            <VStack alignment="leading" spacing={4}>
              {items.map((item) => (
                <Text key={item} textStyle="subheadline" modifiers={WRAP}>
                  {`• ${item}`}
                </Text>
              ))}
            </VStack>
          )}
          {note && (
            <Text
              textStyle="subheadline"
              modifiers={[foregroundStyle("secondary"), ...WRAP]}
            >
              {note}
            </Text>
          )}
        </VStack>
      </Popover.Content>
    </Popover>
  );
}
