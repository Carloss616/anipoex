import type { UniversalBaseProps } from "@expo/ui";

declare module "panelui-native/components/number-input" {
  interface NumberInputProps extends Pick<UniversalBaseProps, "modifiers"> {
    /** A bare string is wrapped in `Typography`; anything else renders as-is. */
    prefix?: React.ReactNode;
    /** A bare string is wrapped in `Typography`; anything else renders as-is. */
    suffix?: React.ReactNode;
    /** @platform android */
    labelVariant?: "default" | "static";
  }
}
