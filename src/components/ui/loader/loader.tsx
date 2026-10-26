import {
  Loader as LoaderBase,
  type LoaderProps as LoaderBaseProps,
} from "panelui-native/components/loader";
import { Spinner } from "panelui-native/components/spinner";
import { useCSSVariable } from "uniwind";
import { trackColorOf } from "./utils";

export interface LoaderProps extends Omit<LoaderBaseProps, "variant"> {
  variant?: LoaderBaseProps["variant"] | "spinner";
}

export function Loader({ variant = "spinner", ...props }: LoaderProps) {
  const resolvedColor = useCSSVariable(props.color ?? "--color-primary");
  if (variant === "spinner") {
    const color =
      typeof resolvedColor === "string" && props.color?.startsWith("--color-")
        ? resolvedColor
        : props.color;
    return (
      <Spinner {...props} color={color} trackColor={trackColorOf(color)} />
    );
  }

  return <LoaderBase {...props} variant={variant} />;
}
