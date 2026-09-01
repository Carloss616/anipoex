import type { UniversalBaseProps } from "@expo/ui";

declare module "panelui-native/components/typography" {
  interface TypographyProps extends Pick<UniversalBaseProps, "modifiers"> {}
}
