import { Button, ScrollView, VStack } from "@expo/ui/swift-ui";
import {
  disabled,
  fixedSize,
  padding,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { useFont } from "@/components/native/swift-ui/text";
import { Calendar } from "@/components/ui/calendar";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Header } from "../header.ios";
import type { DateViewProps } from "./date-view";

export function DateView({ title, value, onCancel, onConfirm }: DateViewProps) {
  const [date, setDate] = useState(value);

  const { isLandscape } = useBreakpoint();
  const font = useFont("body", "medium");
  const destructive = useThemeColor("destructive");

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <Header
        title={title}
        onCancel={onCancel}
        onConfirm={() => onConfirm(date)}
        canConfirm={date?.getTime() !== value?.getTime()}
      />

      <ScrollView
        modifiers={isLandscape ? [] : [fixedSize({ vertical: true })]}
      >
        <VStack modifiers={[padding({ all: 16 })]}>
          <Calendar
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
          />
        </VStack>
      </ScrollView>

      {/* Clearing sits under the calendar, like Delete under an iOS form. */}
      <Button
        label="Remove"
        role="destructive"
        onPress={() => onConfirm()}
        modifiers={[
          font,
          tint(destructive),
          disabled(!date),
          padding({ horizontal: 16 }),
        ]}
      />
    </VStack>
  );
}
