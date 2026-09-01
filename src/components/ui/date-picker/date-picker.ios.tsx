import { Spacer } from "@expo/ui";
import { Label, DatePicker as SwiftUIDatePicker } from "@expo/ui/swift-ui";
import {
  datePickerStyle,
  disabled as disabledModifier,
  font,
  foregroundStyle,
  labelsHidden,
} from "@expo/ui/swift-ui/modifiers";
import { Row } from "@/components/layout/row";
import { useFontFamily } from "@/hooks/use-font";
import { Button } from "../button";
import { CloseButton } from "../close-button";
import { EnsureHost } from "../host";
import { Typography } from "../typography";
import { TYPOGRAPHY_IOS } from "../typography/constants";
import type { DatePickerProps } from "./date-picker";

/**
 * iOS DatePicker: the compact SwiftUI picker has no empty state, so an unset
 * date shows a button instead and the picker appears once there is one.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/datepicker/
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
  const fontFamily = useFontFamily("normal");
  const disabledModifiers = disabled ? [disabledModifier(true)] : [];

  const btnContent = (
    <Button
      onPress={() => onValueChange(new Date())}
      disabled={disabled}
      testID={testID}
      variant="secondary"
      modifiers={[foregroundStyle("secondary")]}
    >
      {placeholder}
    </Button>
  );

  return (
    <EnsureHost matchContents>
      {!value ? (
        label ? (
          <Label>
            <Row alignment="center">
              <Typography>{label}</Typography>
              <Spacer flexible />
              {btnContent}
            </Row>
          </Label>
        ) : (
          btnContent
        )
      ) : (
        <Row alignment="center">
          <SwiftUIDatePicker
            title={label}
            selection={value}
            range={{ start: min, end: max }}
            displayedComponents={["date"]}
            onDateChange={onValueChange}
            modifiers={[
              ...(label ? [] : [labelsHidden()]),
              datePickerStyle("compact"),
              font({ ...TYPOGRAPHY_IOS.body, family: fontFamily }),
              ...disabledModifiers,
            ]}
            testID={testID}
          />
          <CloseButton onPress={() => onValueChange(undefined)} />
        </Row>
      )}
    </EnsureHost>
  );
}
