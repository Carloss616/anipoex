import { Spacer } from "@expo/ui";
import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { ScrollView } from "@/components/layout/scroll-view";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Typography } from "@/components/ui/typography";

export interface DateViewProps {
  title: string;
  value?: Date;
  onCancel: () => void;
  onConfirm: (date?: Date) => void;
}

/**
 * The month grid for a start or finish date. `undefined` is a real answer —
 * a fuzzy date is cleared about as often as it is picked, hence Clear.
 */
export function DateView({ title, value, onCancel, onConfirm }: DateViewProps) {
  const [date, setDate] = useState(value);

  const { isLandscape } = useBreakpoint();

  return (
    <Column className="py-4 android:pt-0">
      <Typography type="h4" className="px-4" numberOfLines={1}>
        {title}
      </Typography>

      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4 android:px-0">
          <Calendar
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
            className="w-full border-none bg-transparent p-0"
          />
        </Column>
      </ScrollView>

      <Row alignment="center" className="gap-4 px-4">
        <Button
          variant="destructive"
          disabled={!date}
          onPress={() => onConfirm()}
        >
          Remove
        </Button>
        <Spacer flexible />
        <Button variant="ghost" cancelRole onPress={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={date?.getTime() === value?.getTime()}
          onPress={() => onConfirm(date)}
        >
          OK
        </Button>
      </Row>
    </Column>
  );
}
