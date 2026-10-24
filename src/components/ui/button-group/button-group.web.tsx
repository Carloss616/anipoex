import {
  type ButtonGroupProps,
  ButtonGroup as PanelButtonGroup,
} from "panelui-native/components/button-group";
import { ArrowKeyGroup } from "../arrow-key-group";

export * from "panelui-native/components/button-group";

/** PanelUI's ButtonGroup, where arrow keys move between the buttons on web. */
export function ButtonGroup(props: ButtonGroupProps) {
  return (
    <ArrowKeyGroup orientation={props.orientation ?? "horizontal"}>
      <PanelButtonGroup {...props} />
    </ArrowKeyGroup>
  );
}
