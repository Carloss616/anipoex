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
import { HELP_HOW, HELP_TITLE } from "../constants";
import type { SyncHelpProps } from "./sync-help";

const WRAP = [fixedSize({ horizontal: false, vertical: true })];

/** A popover bubble (not a sheet) from an info button in the header. */
export function SyncHelp({ moments }: SyncHelpProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover isPresented={open} onIsPresentedChange={setOpen} arrowEdge="top">
      <Popover.Trigger>
        <Button
          onPress={() => setOpen(true)}
          modifiers={[
            buttonStyle("borderless"),
            accessibilityLabel(HELP_TITLE),
          ]}
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
          <Text weight="semibold" modifiers={WRAP}>
            {HELP_TITLE}
          </Text>
          <VStack alignment="leading" spacing={4}>
            {moments.map((moment) => (
              <Text key={moment} textStyle="subheadline" modifiers={WRAP}>
                {`• ${moment}`}
              </Text>
            ))}
          </VStack>
          <Text
            textStyle="subheadline"
            modifiers={[foregroundStyle("secondary"), ...WRAP]}
          >
            {HELP_HOW}
          </Text>
        </VStack>
      </Popover.Content>
    </Popover>
  );
}
