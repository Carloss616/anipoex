import { Card as CardBase, type CardRootProps } from "heroui-native/card";
import { PressableFeedback } from "./pressable-feedback";

export type * from "heroui-native/card";

export interface CardProps extends CardRootProps {
  /** Makes the whole card pressable, with each platform's own feedback. */
  onPress?: () => void;
}

function CardRoot({ children, onPress, ...props }: CardProps) {
  if (!onPress) return <CardBase {...props}>{children}</CardBase>;

  return (
    <PressableFeedback onPress={onPress} className="w-full overflow-visible">
      <CardBase {...props}>
        <PressableFeedback.Highlight />
        {children}
      </CardBase>
    </PressableFeedback>
  );
}

export const Card = Object.assign(CardRoot, {
  Header: CardBase.Header,
  Body: CardBase.Body,
  Footer: CardBase.Footer,
  Title: CardBase.Title,
  Description: CardBase.Description,
});
