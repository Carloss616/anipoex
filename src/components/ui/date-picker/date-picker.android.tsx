import { DatePickerDialog } from "@expo/ui/jetpack-compose";
import { useState } from "react";
import { Column } from "@/components/layout/column";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { formatDate } from "@/utils/utils";
import { Button } from "../button";
import { CloseButton } from "../close-button";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import type { DatePickerProps } from "./date-picker";

/** M3 reads and reports the dialog's day in UTC; this app's dates are local. */
const toUtcDay = (date: Date) =>
  new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();

const fromUtcDay = (date: Date) =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

/**
 * Android DatePicker: a button that opens the M3 date dialog. `label` is
 * unused — the sheet renders the field's caption, not the control.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/datepicker/
 */
export function DatePicker({
  label,
  value,
  onValueChange,
  placeholder = "Add date",
  min,
  max,
  disabled,
  testID,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const m3 = useThemeM3Colors();

  const content = (
    <Button
      disabled={disabled}
      onPress={() => setOpen(true)}
      testID={testID}
      variant="outline"
    >
      {value ? formatDate(value) : placeholder}
      {!!value && (
        <CloseButton
          variant="ghost"
          disabled={disabled}
          onPress={() => onValueChange(undefined)}
          iconProps={{ color: m3.onSurfaceVariant }}
        />
      )}
    </Button>
  );

  return (
    <EnsureHost matchContents>
      {label ? (
        <Column className="gap-2">
          <Typography weight="medium">{label}</Typography>
          {content}
        </Column>
      ) : (
        content
      )}
      {open && (
        <DatePickerDialog
          initialDate={toUtcDay(value ?? new Date())}
          selectableDates={{ start: min, end: max }}
          confirmButtonLabel="OK"
          dismissButtonLabel="Cancel"
          onDateSelected={(date) => {
            onValueChange(fromUtcDay(date));
            setOpen(false);
          }}
          onDismissRequest={() => setOpen(false)}
        />
      )}
    </EnsureHost>
  );
}
