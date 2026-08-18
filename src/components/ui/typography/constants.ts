import type { TypographyType } from "panelui-native/components/typography";
import type { TypographyWeight } from "./typography";

export const PRESET_WEIGHT = {
  h1: "normal",
  h2: "normal",
  h3: "normal",
  h4: "normal",
  h5: "semibold",
  h6: "normal",
  lead: "normal",
  body: "normal",
  "body-sm": "normal",
  "body-xs": "normal",
  large: "semibold",
  small: "medium",
  blockquote: "normal",
  code: "normal",
} as const satisfies Record<TypographyType, TypographyWeight>;

export const TEXT_SIZE = {
  h1: 34,
  h2: 28,
  h3: 22,
  h4: 20,
  h5: 17,
  h6: 15,
  lead: 20,
  body: 16,
  "body-sm": 14,
  "body-xs": 12,
  large: 18,
  small: 14,
  blockquote: 17,
  code: 17,
} as const satisfies Record<TypographyType, number>;
