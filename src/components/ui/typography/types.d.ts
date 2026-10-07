import type { UniversalBaseProps } from "@expo/ui";

declare module "panelui-native/components/typography" {
  interface TypographyProps extends Pick<UniversalBaseProps, "modifiers"> {
    /**
     * Reserves this many lines of height even when the text needs fewer, so
     * siblings below it line up across a row. Pair with `numberOfLines`.
     * @platform ios
     * @platform android
     */
    minLines?: number;
  }
}
