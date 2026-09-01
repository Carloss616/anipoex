import { DatePicker } from "@expo/ui/swift-ui";
import { datePickerStyle, labelsHidden } from "@expo/ui/swift-ui/modifiers";
import type { CalendarProps } from "panelui-native/components/calendar";
import { EnsureHost } from "../host";

/**
 * iOS Calendar: the SwiftUI picker's `graphical` style *is* the month grid.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/
 */
export function Calendar({
  selected,
  onSelect,
  minDate,
  maxDate,
  testID,
}: CalendarProps<"single">) {
  return (
    <EnsureHost matchContents>
      <DatePicker
        selection={selected ?? new Date()}
        range={{ start: minDate, end: maxDate }}
        displayedComponents={["date"]}
        onDateChange={onSelect}
        modifiers={[datePickerStyle("graphical"), labelsHidden()]}
        testID={testID}
      />
    </EnsureHost>
  );
}
