import { ScrollView, VStack } from "@expo/ui/swift-ui";
import { fixedSize, lineLimit, padding } from "@expo/ui/swift-ui/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Text } from "@/components/native/swift-ui/text";
import { Calendar } from "@/components/ui/calendar";
import { Footer } from "../footer";
import type { DateViewProps } from "./date-view";

export function DateView({ title, value, onCancel, onConfirm }: DateViewProps) {
  const [date, setDate] = useState(value);

  const { isLandscape } = useBreakpoint();

  return (
    <VStack
      alignment="leading"
      spacing={0}
      modifiers={[padding({ vertical: 16 })]}
    >
      <Text
        textStyle="title3"
        modifiers={[lineLimit(1), padding({ horizontal: 16 })]}
      >
        {title}
      </Text>

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

      <Footer
        onRemove={() => onConfirm()}
        canRemove={!!date}
        onCancel={onCancel}
        onConfirm={() => onConfirm(date)}
        canConfirm={date?.getTime() !== value?.getTime()}
      />
    </VStack>
  );
}
