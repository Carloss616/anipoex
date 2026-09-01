import type { UniversalStyle } from "@expo/ui";
import { RadioButton } from "@expo/ui/jetpack-compose";
import {
  selectable,
  selectableGroup,
} from "@expo/ui/jetpack-compose/modifiers";
import type {
  RadioGroupItemProps,
  RadioGroupProps,
} from "panelui-native/components/radio-group";
import { cn } from "panelui-native/utils/cn";
import { Children, isValidElement } from "react";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { EnsureHost } from "../host";
import { Typography } from "../typography";

/** `RadioGroup.Item` is a marker on Android: the Row below draws the option. */
const itemsOf = (children: React.ReactNode) =>
  Children.toArray(children)
    .filter(isValidElement<RadioGroupItemProps>)
    .map((child) => child.props);

/**
 * Android RadioGroup: the M3 recommendation — the whole row is the target via
 * `selectable`, the disc only reports state, and `selectableGroup` tells the
 * screen reader the rows are one choice.
 *
 * `variant` and `orientation` are dropped; M3's radio group is a vertical list.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/radiobutton/#radio-group-recommended
 */
function RadioGroupRoot({
  value,
  onValueChange,
  disabled,
  children,
  style,
  className,
  testID,
}: RadioGroupProps) {
  return (
    <EnsureHost matchContents>
      <Column
        testID={testID}
        modifiers={[selectableGroup()]}
        className={className}
        style={style as UniversalStyle}
      >
        {itemsOf(children).map((item) => {
          const itemDisabled = disabled || item.disabled;

          return (
            <Row
              key={item.value}
              modifiers={[
                selectable(
                  value === item.value,
                  () => !itemDisabled && onValueChange(item.value),
                  "radioButton",
                ),
              ]}
            >
              <Row
                alignment="center"
                className={cn("h-14 w-full gap-4", item.className)}
              >
                <RadioButton selected={value === item.value} />
                <Column className="flex-1">
                  <Typography muted={itemDisabled}>
                    {item.label ?? item.value}
                  </Typography>
                  {item.description ? (
                    <Typography type="body-sm" muted>
                      {item.description}
                    </Typography>
                  ) : null}
                </Column>
              </Row>
            </Row>
          );
        })}
      </Column>
    </EnsureHost>
  );
}

/**
 * A marker, never rendered: `RadioGroupRoot` reads its props and draws the
 * native row itself. It exists so the compound call site is the same on every
 * platform.
 */
const Item = (_props: RadioGroupItemProps) => null;

export const RadioGroup = Object.assign(RadioGroupRoot, { Item });
