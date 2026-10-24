import {
  RadioGroup as PanelRadioGroup,
  type RadioGroupProps,
} from "panelui-native/components/radio-group";
import { Children, isValidElement, useEffect, useRef } from "react";
import { ArrowKeyGroup } from "../arrow-key-group";

export * from "panelui-native/components/radio-group";

type Option = { value: string; disabled?: boolean };

/** PanelUI's RadioGroup, where arrow keys move and select, as a radio group does on web. */
function RadioGroupRoot(props: RadioGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const options = Children.toArray(props.children).flatMap((child) =>
    isValidElement<Option>(child) && child.props.value !== undefined
      ? [child.props]
      : [],
  );
  // The arrows walk only the options that can take focus.
  const enabled = options.filter((option) => !option.disabled);

  // PanelUI's radios set accessibilityState, which react-native-web doesn't
  // turn into aria-checked: without it a screen reader can't tell the pick.
  useEffect(() => {
    const radios = ref.current?.querySelectorAll('[role="radio"]') ?? [];
    for (const [index, radio] of [...radios].entries())
      radio.setAttribute(
        "aria-checked",
        String(options[index]?.value === props.value),
      );
  });

  return (
    <ArrowKeyGroup
      orientation={
        props.orientation === "horizontal" ? "horizontal" : "vertical"
      }
      onMove={(index) => props.onValueChange(enabled[index].value)}
    >
      <div ref={ref} style={{ display: "contents" }}>
        <PanelRadioGroup {...props} />
      </div>
    </ArrowKeyGroup>
  );
}

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Item: PanelRadioGroup.Item,
});
