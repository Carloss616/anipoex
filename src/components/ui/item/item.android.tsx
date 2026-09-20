import { ListItem } from "@expo/ui/jetpack-compose";
import { alpha, clickable } from "@expo/ui/jetpack-compose/modifiers";
import { cn } from "panelui-native/utils/cn";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { EnsureHost } from "../host";
import { Separator } from "../separator";
import { Typography } from "../typography";
import {
  DESCRIPTION_TYPES,
  ItemSizeContext,
  MEDIA_SIZES,
  TITLE_TYPES,
  useItemSize,
} from "./constants";
import type {
  ItemActionsProps,
  ItemContentProps,
  ItemDescriptionProps,
  ItemGroupProps,
  ItemMediaProps,
  ItemProps,
  ItemSeparatorProps,
  ItemTitleProps,
} from "./item";

/**
 * M3's `ListItem` owns its padding, so `size` only reaches the text presets
 * and `className` has nowhere to land on the row itself.
 */
function ItemRoot({
  size = "default",
  disabled,
  onPress,
  children,
}: ItemProps) {
  return (
    <ItemSizeContext.Provider value={size}>
      <EnsureHost matchContents>
        <ListItem
          colors={{ containerColor: "transparent" }}
          modifiers={[
            // Compose hands over no gesture event, and nothing downstream of
            // a row reads one.
            ...(onPress && !disabled ? [clickable(onPress as () => void)] : []),
            ...(disabled ? [alpha(0.64)] : []),
          ]}
        >
          {children}
        </ListItem>
      </EnsureHost>
    </ItemSizeContext.Provider>
  );
}

/**
 * Stack of rows, as a plain `Column` — the web group is a stack too, and it
 * never scrolls.
 *
 * `LazyColumn` is the Compose list, but it scrolls itself: measured with an
 * unbounded height — which is what a `Host matchContents` inside a React Native
 * `ScrollView` hands it — it throws rather than laying out. A group that has to
 * scroll belongs in `LegendList`, which recycles; `LazyColumn` still creates
 * every child up front.
 */
function ItemGroup({ className, children }: ItemGroupProps) {
  return (
    <EnsureHost matchContents>
      <Column className={cn("w-full", className)}>{children}</Column>
    </EnsureHost>
  );
}

function ItemSeparator({ className, testID }: ItemSeparatorProps) {
  return <Separator className={className} testID={testID} />;
}

function ItemMedia({
  variant = "default",
  size,
  className,
  children,
}: ItemMediaProps) {
  const itemSize = useItemSize();

  return (
    <ListItem.LeadingContent>
      <Column
        alignment="center"
        className={cn(MEDIA_SIZES[variant][size ?? itemSize], className)}
      >
        {children}
      </Column>
    </ListItem.LeadingContent>
  );
}

/**
 * Pass-through: `ListItem` only finds its slots among its own direct children,
 * so the text column can't be a view of its own here — the headline and the
 * supporting text have to reach the row themselves.
 */
function ItemContent({ children }: ItemContentProps) {
  return <>{children}</>;
}

function ItemTitle({ className, children, ...props }: ItemTitleProps) {
  return (
    <ListItem.HeadlineContent>
      <Typography
        type={TITLE_TYPES[useItemSize()]}
        weight="medium"
        className={className}
        {...props}
      >
        {children}
      </Typography>
    </ListItem.HeadlineContent>
  );
}

function ItemDescription({
  className,
  children,
  ...props
}: ItemDescriptionProps) {
  return (
    <ListItem.SupportingContent>
      <Typography
        type={DESCRIPTION_TYPES[useItemSize()]}
        muted
        className={className}
        {...props}
      >
        {children}
      </Typography>
    </ListItem.SupportingContent>
  );
}

function ItemActions({ className, children }: ItemActionsProps) {
  return (
    <ListItem.TrailingContent>
      <Row alignment="center" className={cn("gap-1.5", className)}>
        {children}
      </Row>
    </ListItem.TrailingContent>
  );
}

/**
 * Android Item: same props as [the web one](./item.tsx), drawn as M3's
 * `ListItem`.
 *
 * `orientation` has no analogue here — a `ListItem` is always horizontal and a
 * `LazyColumn` always vertical, so `Item.Header` and `Item.Footer`, which only
 * make sense once a row stacks, stay web-only. A dimmed row is `disabled`
 * rather than an `opacity-*` class on `Item.Content`: the alpha has to sit on
 * the row for the ripple to dim with it.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/listitem/
 */
export const Item = Object.assign(ItemRoot, {
  Group: ItemGroup,
  Separator: ItemSeparator,
  Media: ItemMedia,
  Content: ItemContent,
  Title: ItemTitle,
  Description: ItemDescription,
  Actions: ItemActions,
});
