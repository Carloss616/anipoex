import type { UniversalStyle } from "@expo/ui";
import { Picker } from "@expo/ui/swift-ui";
import { labelsHidden, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import type {
  RadioGroupItemProps,
  RadioGroupProps,
} from "panelui-native/components/radio-group";
import { Children, isValidElement } from "react";
import { Column } from "@/components/layout/column";
import { EnsureHost } from "../host";
import { Typography } from "../typography";

/** `RadioGroup.Item` is a marker on iOS: the Picker draws the rows itself. */
const itemsOf = (children: React.ReactNode) =>
  Children.toArray(children)
    .filter(isValidElement<RadioGroupItemProps>)
    .map((child) => child.props);

/**
 * iOS RadioGroup: an `inline` Picker *is* the checkmark list — the platform's
 * own single-choice control, not a disc-and-label imitation. It lays its rows
 * out in whatever container it lands in; a `List` around it would look the
 * part but has no intrinsic height, and collapses inside a sheet that sizes
 * itself to its contents.
 *
 * `variant`, `orientation` and `description` are dropped: the inline Picker
 * takes plain `Text` rows and lays them out vertically, and re-creating the
 * card treatment on top of it would fight the native chrome.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/picker/
 */
function RadioGroupRoot({
  value,
  onValueChange,
  disabled,
  children,
  testID,
  className,
  style,
  pickerStyle: pickerStyleType = "wheel",
}: RadioGroupProps) {
  const items = itemsOf(children);

  return (
    <EnsureHost matchContents>
      <Column className={className} style={style as UniversalStyle}>
        <Picker
          testID={testID}
          selection={value ?? null}
          onSelectionChange={(selection) => {
            if (!disabled && typeof selection === "string") {
              onValueChange(selection);
            }
          }}
          modifiers={[pickerStyle(pickerStyleType), labelsHidden()]}
        >
          {items.map((item) => (
            <Typography key={item.value} modifiers={[tag(item.value)]}>
              {item.label ?? item.value}
            </Typography>
          ))}
        </Picker>
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
