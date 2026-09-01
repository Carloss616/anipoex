import { DatePicker as PanelDatePicker } from "panelui-native/components/date-picker";
import { Field } from "panelui-native/components/field";
import { View } from "react-native";
import { formatDate } from "@/utils/utils";
import { Button, type ButtonProps } from "../button";
import { CloseButton } from "../close-button";
import { Icon } from "../icon";
import { Typography } from "../typography";

export interface DatePickerProps {
  label: string;
  value?: Date;
  onValueChange: (value: Date | undefined) => void;
  placeholder?: string;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  testID?: string;
}

/** `undefined` is a real value: a fuzzy date is cleared as often as it is picked. */
export function DatePicker({
  label,
  value,
  onValueChange,
  placeholder = "Pick a date",
  min,
  max,
  disabled,
  testID,
}: DatePickerProps) {
  const content = (
    <PanelDatePicker
      mode="single"
      selected={value}
      onSelect={onValueChange}
      minDate={min}
      maxDate={max}
      disabled={disabled}
      placeholder={placeholder}
      captionLayout="dropdown"
    >
      <ButtonView
        label={label}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        disabled={disabled}
        testID={testID}
      />
    </PanelDatePicker>
  );

  return label ? (
    <Field className="w-full">
      <Field.Label>{label}</Field.Label>
      {content}
    </Field>
  ) : (
    content
  );
}

function ButtonView({
  label,
  value,
  onValueChange,
  placeholder,
  disabled,
  testID,
  onPress,
}: Pick<
  DatePickerProps,
  "label" | "value" | "onValueChange" | "placeholder" | "disabled" | "testID"
> &
  Pick<ButtonProps, "onPress">) {
  return (
    <View className="relative w-full">
      <Button
        variant="outline"
        className="min-h-13.5 w-full gap-4 bg-background px-4 py-0 shadow-none"
        accessibilityLabel={label}
        testID={testID}
        onPress={onPress}
      >
        <Icon name="calendar" size={18} muted />
        <Typography weight="medium" muted={!value} numberOfLines={1}>
          {value ? formatDate(value) : placeholder}
        </Typography>
        <View className="min-w-1 flex-1" />
      </Button>
      {!!value && (
        <CloseButton
          variant="ghost"
          disabled={disabled}
          onPress={() => onValueChange(undefined)}
          accessibilityLabel={`Clear ${label}`}
          className="absolute top-1/2 right-[7] -translate-y-1/2"
          iconProps={{ muted: true }}
        />
      )}
    </View>
  );
}
