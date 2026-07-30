import {
  Button as ButtonBase,
  FilledIconButton,
  FilledTonalButton,
  FilledTonalIconButton,
  IconButton,
  OutlinedButton,
  OutlinedIconButton,
  Row,
  Text,
  TextButton,
  type TextProps,
} from "@expo/ui/jetpack-compose";
import { height, width } from "@expo/ui/jetpack-compose/modifiers";
import type {
  ButtonContextValue,
  ButtonLabelProps,
  ButtonRootProps,
  ButtonSize,
  ButtonVariant,
} from "heroui-native/button";
import { useThemeColor } from "heroui-native/hooks";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useId,
} from "react";
import { textOf } from "@/utils/utils";
import { Host, useIsInsideHost } from "./host";

type TypographyStyle = NonNullable<
  NonNullable<TextProps["style"]>["typography"]
>;

const VARIANTS = {
  primary: ButtonBase,
  secondary: FilledTonalButton,
  tertiary: FilledTonalButton,
  outline: OutlinedButton,
  ghost: TextButton,
  danger: ButtonBase,
  "danger-soft": FilledTonalButton,
} as const satisfies Record<ButtonVariant, unknown>;

const ICON_VARIANTS = {
  primary: FilledIconButton,
  secondary: FilledTonalIconButton,
  tertiary: FilledTonalIconButton,
  outline: OutlinedIconButton,
  ghost: IconButton,
  danger: FilledIconButton,
  "danger-soft": FilledTonalIconButton,
} as const satisfies Record<ButtonVariant, unknown>;

const SIZES = {
  sm: { height: 40, spacing: 6 },
  md: { height: 48, spacing: 8 },
  lg: { height: 56, spacing: 10 },
} as const satisfies Record<ButtonSize, { height: number; spacing: number }>;

const LABEL_SIZES = {
  sm: "bodySmall",
  md: "bodyMedium",
  lg: "bodyLarge",
} as const satisfies Record<ButtonSize, TypographyStyle>;

const ButtonContext = createContext<ButtonContextValue | null>(null);

export function useButton() {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error("useButton must be used within a Button");
  }
  return context;
}

function ButtonRoot({
  children,
  variant = "primary",
  size = "md",
  isIconOnly = false,
  isDisabled = false,
  onPress,
}: ButtonRootProps) {
  const id = useId();
  const isInsideHost = useIsInsideHost();
  const [danger, dangerForeground, dangerSoft, dangerSoftForeground] =
    useThemeColor([
      "danger",
      "danger-foreground",
      "danger-soft",
      "danger-soft-foreground",
    ]);

  const { spacing, height: buttonHeight } = SIZES[size];
  const ButtonComponent = isIconOnly
    ? ICON_VARIANTS[variant]
    : VARIANTS[variant];

  // A bare string child is the documented shorthand for <Button.Label>.
  const content = Children.toArray(children).map((child, index) =>
    isValidElement(child) ? (
      child
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: text children have no stable id
      <ButtonLabel key={`${id}-${index}`}>{child}</ButtonLabel>
    ),
  );

  const button = (
    <ButtonComponent
      enabled={!isDisabled}
      modifiers={[
        height(buttonHeight),
        ...(isIconOnly ? [width(buttonHeight)] : []),
      ]}
      onClick={onPress as (() => void) | undefined}
      colors={
        variant === "danger"
          ? { containerColor: danger, contentColor: dangerForeground }
          : variant === "danger-soft"
            ? { containerColor: dangerSoft, contentColor: dangerSoftForeground }
            : undefined
      }
    >
      {isIconOnly ? (
        content
      ) : (
        <Row
          horizontalArrangement={{ spacedBy: spacing }}
          horizontalAlignment="center"
        >
          {content}
        </Row>
      )}
    </ButtonComponent>
  );

  return (
    <ButtonContext.Provider
      value={{
        size,
        variant,
        isDisabled,
      }}
    >
      {isInsideHost ? button : <Host matchContents>{button}</Host>}
    </ButtonContext.Provider>
  );
}

function ButtonLabel({ children, numberOfLines }: ButtonLabelProps) {
  const { size } = useButton();

  return (
    <Text
      maxLines={numberOfLines}
      style={{ typography: LABEL_SIZES[size], fontWeight: "500" }}
    >
      {textOf(children)}
    </Text>
  );
}

export const Button = Object.assign(ButtonRoot, {
  Label: ButtonLabel,
});
