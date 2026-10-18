import { Column } from "@expo/ui/jetpack-compose";
import {
  fillMaxWidth,
  padding,
  verticalScroll,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { Calendar } from "@/components/ui/calendar";
import { Footer } from "../footer";
import type { DateViewProps } from "./date-view";

export function DateView({ title, value, onCancel, onConfirm }: DateViewProps) {
  const [date, setDate] = useState(value);

  const { isLandscape } = useBreakpoint();

  return (
    <Column modifiers={[padding(0, 0, 0, 16)]}>
      <Text
        style={{ typography: "titleLarge" }}
        maxLines={1}
        overflow="ellipsis"
        modifiers={[padding(16, 0, 16, 0)]}
      >
        {title}
      </Text>

      <Column
        modifiers={[
          fillMaxWidth(),
          ...(isLandscape ? [weight(1)] : []),
          verticalScroll(),
          // The picker brings its own side margins.
          padding(0, 16, 0, 16),
        ]}
      >
        <Calendar selected={date} onSelect={setDate} captionLayout="dropdown" />
      </Column>

      <Footer
        onRemove={() => onConfirm()}
        canRemove={!!date}
        onCancel={onCancel}
        onConfirm={() => onConfirm(date)}
        canConfirm={date?.getTime() !== value?.getTime()}
      />
    </Column>
  );
}
