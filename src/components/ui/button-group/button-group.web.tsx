import {
  type ButtonGroupProps,
  ButtonGroup as PanelButtonGroup,
} from "panelui-native/components/button-group";
import { ArrowKeyGroup } from "../arrow-key-group";

export * from "panelui-native/components/button-group";

/** PanelUI's ButtonGroup, where arrow keys move between the buttons on web. */
export function ButtonGroup(props: ButtonGroupProps) {
  const orientation = props.orientation ?? "horizontal";
  return (
    <ArrowKeyGroup orientation={orientation}>
      {/* global.css joins attached segments into one shape (corners, inset ring). */}
      <PanelButtonGroup
        data-attached={
          props.attached === false
            ? undefined
            : orientation === "vertical"
              ? "column"
              : "row"
        }
        {...props}
      />
    </ArrowKeyGroup>
  );
}
