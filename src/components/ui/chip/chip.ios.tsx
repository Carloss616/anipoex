import { Button } from "@expo/ui/swift-ui";
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  tint,
} from "@expo/ui/swift-ui/modifiers";
import { useFontFamily } from "@/hooks/use-font";
import { useThemeColor } from "@/hooks/use-theme-color";
import { textOf } from "@/utils/utils";
import { SEMANTIC_COLOR } from "../colors";
import { EnsureHost } from "../host";
import type { ChipLabelProps, ChipProps, ChipSize, ChipVariant } from "./chip";
import { COLORS } from "./constants";

type ControlSize = Parameters<typeof controlSize>[0];
type ButtonStyle = Parameters<typeof buttonStyle>[0];

const SIZES = {
  sm: "mini",
  md: "small",
  lg: "regular",
} as const satisfies Record<ChipSize, ControlSize>;

const FONT_SIZES = {
  sm: 12,
  md: 13,
  lg: 14,
} as const satisfies Record<ChipSize, number>;

const VARIANTS = {
  default: "glass",
  primary: "glassProminent",
  outline: "borderless",
  success: "glass",
  warning: "glass",
  info: "glass",
  destructive: "glass",
} as const satisfies Record<ChipVariant, ButtonStyle>;

const SELECTED_VARIANTS = {
  default: "glassProminent",
  primary: "glassProminent",
  outline: "glass",
  success: "glassProminent",
  warning: "glassProminent",
  info: "glassProminent",
  destructive: "glassProminent",
} as const satisfies Record<ChipVariant, ButtonStyle>;

/**
 * iOS Chip: same props as PanelUI's, rendered as a capsule SwiftUI
 * `Button` — iOS has no chip of its own.
 *
 * @see https://heroui.com/docs/native/components/chip
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/button/
 */
export function Chip({
  children,
  size = "sm",
  variant = "default",
  selected = false,
  disabled: isDisabled = false,
  onPress,
  testID,
}: ChipProps) {
  const semanticColor = COLORS[variant];
  const tintColor = useThemeColor(SEMANTIC_COLOR[semanticColor].token.fill);
  const themeFamily = useFontFamily("normal");

  return (
    <EnsureHost matchContents>
      <Button
        label={textOf(children)}
        onPress={onPress as (() => void) | undefined}
        modifiers={[
          buttonStyle(
            selected ? SELECTED_VARIANTS[variant] : VARIANTS[variant],
          ),
          buttonBorderShape("capsule"),
          controlSize(SIZES[size]),
          disabled(!!isDisabled),
          tint(tintColor),
          font({
            textStyle: "caption",
            size: FONT_SIZES[size],
            family: themeFamily,
          }),
        ]}
        testID={testID as string | undefined}
        role={variant === "destructive" ? "destructive" : undefined}
      />
    </EnsureHost>
  );
}

function ChipLabel(_: ChipLabelProps) {
  return null;
}

Chip.Label = ChipLabel;
