import { Children, Fragment, isValidElement, type ReactNode } from "react";

export type RadioOption = { value: string; disabled?: boolean };

/** The options among a RadioGroup's children, in order; `Children.toArray` alone doesn't open Fragments. */
export function radioOptions(children: ReactNode): RadioOption[] {
  return Children.toArray(children).flatMap((child): RadioOption[] => {
    if (!isValidElement<{ children?: ReactNode } & Partial<RadioOption>>(child))
      return [];
    if (child.type === Fragment) return radioOptions(child.props.children);
    const { value, disabled } = child.props;
    if (value === undefined) return [];
    return disabled === undefined ? [{ value }] : [{ value, disabled }];
  });
}
