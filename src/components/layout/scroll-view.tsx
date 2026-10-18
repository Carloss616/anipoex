import {
  ScrollView as ScrollViewBase,
  type ScrollViewProps as ScrollViewBaseProps,
} from "@expo/ui";
import { cn } from "panelui-native/utils/cn";
import { withUniwind } from "uniwind";

const ScrollViewRoot = withUniwind(ScrollViewBase);

export interface ScrollViewProps extends ScrollViewBaseProps {
  className?: string;
  /** Take the leftover space in the parent instead of the content's height. */
  fill?: boolean;
}

export function ScrollView({ fill, className, ...props }: ScrollViewProps) {
  return (
    <ScrollViewRoot
      className={cn(fill && "min-h-0 flex-1", className)}
      {...props}
    />
  );
}
