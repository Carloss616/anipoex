import { DateTimePicker } from "@expo/ui/jetpack-compose";
import type { CalendarProps } from "panelui-native/components/calendar";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { EnsureHost } from "../host";

/** M3 reads and reports the grid's day in UTC; this app's dates are local. */
const toUtcDay = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();

const fromUtcDay = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

/**
 * Android Calendar: the inline M3 date picker, with its keyboard-entry toggle
 * off — this is the grid, not a field.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/datetimepicker/
 */
export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  className,
  testID,
}: CalendarProps<"single">) {
  const m3 = useThemeM3Colors();

  return (
    <EnsureHost matchContents className={className} testID={testID}>
      <DateTimePicker
        initialDate={toUtcDay(selected ?? new Date())}
        displayedComponents="date"
        variant="picker"
        showVariantToggle={false}
        selectableDates={{ start: minDate, end: maxDate }}
        elementColors={{ containerColor: m3.surfaceContainerLow }}
        onDateSelected={(date) => onSelect?.(fromUtcDay(date))}
      />
    </EnsureHost>
  );
}
