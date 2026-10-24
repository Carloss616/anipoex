import {
  RadioGroup as PanelRadioGroup,
  type RadioGroupProps,
} from "panelui-native/components/radio-group";
import { Children, isValidElement } from "react";
import { ArrowKeyGroup } from "../arrow-key-group";

export * from "panelui-native/components/radio-group";

/** PanelUI's RadioGroup, where arrow keys move and select, as a radio group does on web. */
function RadioGroupRoot(props: RadioGroupProps) {
  // The values of the focusable options, in the order the arrows walk them.
  const values = Children.toArray(props.children).flatMap((child) =>
    isValidElement<{ value?: string; disabled?: boolean }>(child) &&
    child.props.value !== undefined &&
    !child.props.disabled
      ? [child.props.value]
      : [],
  );

  return (
    <ArrowKeyGroup
      orientation={
        props.orientation === "horizontal" ? "horizontal" : "vertical"
      }
      onMove={(index) => props.onValueChange(values[index])}
    >
      <PanelRadioGroup {...props} />
    </ArrowKeyGroup>
  );
}

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: PanelRadioGroup.Item,
});
