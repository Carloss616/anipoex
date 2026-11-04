import type { ViewEvent } from "@expo/ui/jetpack-compose";
import {
  createViewModifierEventListener,
  type ModifierConfig,
} from "@expo/ui/jetpack-compose/modifiers";
import { requireNativeView } from "expo";
import { useFontFamily } from "@/hooks/use-font";

export interface ButtonGroupProps {
  /** One label per button, in order. */
  options: string[];
  /** Indexes of the checked buttons. */
  selected: number[];
  /** Several buttons can be on at once; otherwise it's a single choice. */
  multiple?: boolean;
  /** A press: the button and the state it asks for. */
  onChange: (index: number, checked: boolean) => void;
  modifiers?: ModifierConfig[];
}

type NativeProps = Omit<ButtonGroupProps, "onChange"> & {
  fontFamily?: string;
} & ViewEvent<"onToggle", { index: number; checked: boolean }>;

const NativeButtonGroup = requireNativeView<NativeProps>(
  "ButtonGroup",
  "ButtonGroupView",
);

/**
 * M3 Expressive connected button group, from the local `modules/button-group`;
 * it replaces segmented buttons. Must sit inside a Host; give it `fillMaxWidth()`,
 * as the group spans its container.
 */
export function ButtonGroup({
  modifiers,
  onChange,
  ...props
}: ButtonGroupProps) {
  const fontFamily = useFontFamily("medium");

  return (
    <NativeButtonGroup
      {...props}
      fontFamily={fontFamily}
      modifiers={modifiers}
      {...(modifiers ? createViewModifierEventListener(modifiers) : undefined)}
      onToggle={({ nativeEvent }) =>
        onChange(nativeEvent.index, nativeEvent.checked)
      }
    />
  );
}
