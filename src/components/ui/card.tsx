import type { UniversalHostProps } from "@expo/ui";
import { Card as CardBase, type CardRootProps } from "heroui-native/card";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { PressableFeedback } from "./pressable-feedback";

export type * from "heroui-native/card";

export interface CardProps extends CardRootProps {
  /** Makes the whole card pressable, with each platform's own feedback. */
  onPress?: () => void;
  host?: UniversalHostProps;
}

export interface CardBackgroundProps {
  children?: ReactNode;
  className?: string;
}

/**
 * A layer behind the card's sections — cover art, a placeholder, a scrim. The
 * sections stack on top of it. Native has no absolute positioning, so this is
 * how a card overlaps content there.
 */
function CardBackground({ children, className }: CardBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill} className={className}>
      {children}
    </View>
  );
}

function CardRoot({ children, onPress, ...props }: CardProps) {
  if (!onPress) return <CardBase {...props}>{children}</CardBase>;

  return (
    <CardBase asChild {...props}>
      <PressableFeedback>
        {children}
        <PressableFeedback.Highlight />
      </PressableFeedback>
    </CardBase>
  );
}

export const Card = Object.assign(CardRoot, {
  Background: CardBackground,
  Header: CardBase.Header,
  Body: CardBase.Body,
  Footer: CardBase.Footer,
  Title: CardBase.Title,
  Description: CardBase.Description,
});
