import {
  type ItemProps,
  Item as PanelItem,
} from "panelui-native/components/item";
import { cn } from "panelui-native/utils/cn";

export * from "panelui-native/components/item";

const ROW_HOVER = "hover:bg-secondary/90 active:bg-accent";

const HOVER_VARIANTS = {
  default: ROW_HOVER,
  outline: ROW_HOVER,
  muted: "hover:bg-surface-tertiary/90 active:bg-accent",
} satisfies Record<NonNullable<ItemProps["variant"]>, string>;

function ItemRoot({ className, ...props }: ItemProps) {
  return (
    <PanelItem
      {...props}
      className={cn(
        props.onPress &&
          !props.disabled && [
            "transition-colors",
            HOVER_VARIANTS[props.variant ?? "default"],
          ],
        className,
      )}
    />
  );
}

/** PanelUI's Item with hover on web when pressable. */
export const Item = Object.assign(ItemRoot, {
  Group: PanelItem.Group,
  Separator: PanelItem.Separator,
  Media: PanelItem.Media,
  Content: PanelItem.Content,
  Title: PanelItem.Title,
  Description: PanelItem.Description,
  Actions: PanelItem.Actions,
  Header: PanelItem.Header,
  Footer: PanelItem.Footer,
});
