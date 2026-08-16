import {
  Loader as LoaderBase,
  type LoaderProps as LoaderBaseProps,
} from "panelui-native/components/loader";
import { Spinner } from "panelui-native/components/spinner";

export interface LoaderProps extends Omit<LoaderBaseProps, "variant"> {
  variant?: LoaderBaseProps["variant"] | "spinner";
}

export function Loader({ variant = "spinner", ...props }: LoaderProps) {
  if (variant === "spinner") return <Spinner {...props} />;

  return <LoaderBase {...props} variant={variant} />;
}
