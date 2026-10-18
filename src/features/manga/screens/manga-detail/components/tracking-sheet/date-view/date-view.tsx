import { useBreakpoint } from "panelui-native/hooks/use-breakpoint";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { ScrollView } from "@/components/layout/scroll-view";
import { Calendar } from "@/components/ui/calendar";
import { Typography } from "@/components/ui/typography";
import { Footer } from "../footer";

export interface DateViewProps {
  title: string;
  value?: Date;
  onCancel: () => void;
  onConfirm: (date?: Date) => void;
}

/**
 * The month grid for a start or finish date. `undefined` is a real answer —
 * a fuzzy date is cleared about as often as it is picked, hence Remove.
 */
export function DateView({ title, value, onCancel, onConfirm }: DateViewProps) {
  const [date, setDate] = useState(value);

  const { isLandscape } = useBreakpoint();

  return (
    <Column className="py-4">
      <Typography type="h4" className="px-4" numberOfLines={1}>
        {title}
      </Typography>

      <ScrollView fill={isLandscape} className="w-full">
        <Column className="p-4">
          <Calendar
            selected={date}
            onSelect={setDate}
            captionLayout="dropdown"
            className="w-full border-none bg-transparent p-0"
          />
        </Column>
      </ScrollView>

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
