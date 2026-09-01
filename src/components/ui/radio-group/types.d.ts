import type { PickerStyleType } from "@expo/ui/swift-ui/modifiers";

declare module "panelui-native/components/radio-group" {
  interface RadioGroupProps {
    /** @platform ios */
    pickerStyle?: PickerStyleType;
  }
}
