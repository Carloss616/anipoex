import type { ButtonSize } from "panelui-native/components/button";
import type { TypographyParagraphProps } from "panelui-native/components/typography";

export const LABEL_SIZES = {
  sm: "body-sm",
  md: "body",
  lg: "large",
  icon: "body",
} as const satisfies Record<ButtonSize, TypographyParagraphProps["type"]>;

export const SPACING = {
  sm: 4,
  md: 6,
  lg: 8,
  icon: 0,
} as const satisfies Record<ButtonSize, number>;
