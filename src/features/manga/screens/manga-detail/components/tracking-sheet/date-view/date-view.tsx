import { Sheet } from "panelui-web/sheet";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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

  return (
    <>
      <Sheet.Header title={title} />

      <Sheet.Body>
        <Calendar
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          className="w-full border-none bg-transparent p-0"
        />
      </Sheet.Body>

      <Footer
        onRemove={() => onConfirm()}
        canRemove={!!date}
        onCancel={onCancel}
        onConfirm={() => onConfirm(date)}
        canConfirm={date?.getTime() !== value?.getTime()}
      />
    </>
  );
}
