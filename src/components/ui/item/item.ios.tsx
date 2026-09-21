import { Spacer } from "@expo/ui";
import { LazyVStack, ZStack } from "@expo/ui/swift-ui";
import {
  background,
  clipShape,
  frame,
  opacity,
  strokeBorder,
} from "@expo/ui/swift-ui/modifiers";
import { cn } from "panelui-native/utils/cn";
import { withUniwind } from "uniwind";
import { Column } from "@/components/layout/column";
import { Row } from "@/components/layout/row";
import { Feedback } from "../feedback";
import { EnsureHost } from "../host";
import { Separator } from "../separator";
import { Typography } from "../typography";
import {
  DESCRIPTION_TYPES,
  ItemSizeContext,
  PADDINGS,
  TITLE_TYPES,
  useItemSize,
  useMediaTile,
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

function ItemRoot({
  size = "default",
  disabled,
  onPress,
  className,
  children,
  testID,
}: ItemProps) {
  return (
    <ItemSizeContext.Provider value={size}>
      <EnsureHost matchContents>
        <Feedback
          for={Row}
          // A SwiftUI button hands over no gesture event, and nothing
          // downstream of a row reads one.
          onPress={
            disabled
              ? undefined
              : ((onPress ?? undefined) as (() => void) | undefined)
          }
          alignment="center"
          className={cn(PADDINGS[size], className)}
          modifiers={disabled ? [opacity(0.64)] : undefined}
          testID={testID}
        >
          {children}
        </Feedback>
      </EnsureHost>
    </ItemSizeContext.Provider>
  );
}

/**
 * Stack of rows, as a `LazyVStack`. It only goes lazy inside a `ScrollView` —
 * anywhere else SwiftUI lays it out like a plain `VStack`, which is what a
 * short group inside a `Surface` wants anyway.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/lazyvstack/
 */
function ItemGroup({ children, testID }: ItemGroupProps) {
  return (
    <EnsureHost matchContents>
      <LazyVStack alignment="leading" spacing={0} testID={testID}>
        {children}
      </LazyVStack>
    </EnsureHost>
  );
}

function ItemSeparator({ className, testID }: ItemSeparatorProps) {
  return <Separator className={className} testID={testID} />;
}

function ItemMediaBase({ variant, size, style, children }: ItemMediaProps) {
  const tile = useMediaTile({ variant, size, style });

  if (!tile) return <Column alignment="center">{children}</Column>;

  return (
    <ZStack
      modifiers={[
        // A fixed frame centers what it holds on both axes by default.
        frame({ width: tile.side, height: tile.side }),
        background(tile.fill),
        clipShape("roundedRectangle", tile.radius),
        ...(tile.border
          ? [
              strokeBorder({
                content: tile.border,
                shape: "roundedRectangle",
                cornerRadius: tile.radius,
              }),
            ]
          : []),
      ]}
    >
      {children}
    </ZStack>
  );
}

const ItemMedia = withUniwind(ItemMediaBase);

/**
 * The text column. A SwiftUI `HStack` hugs its children, so the `Spacer` is
 * what pins `Item.Actions` to the trailing edge.
 */
function ItemContent({ className, children }: ItemContentProps) {
  return (
    <>
      <Column alignment="start" className={cn("gap-0.5", className)}>
        {children}
      </Column>
      <Spacer />
    </>
  );
}

function ItemTitle({ className, children, ...props }: ItemTitleProps) {
  return (
    <Typography
      type={TITLE_TYPES[useItemSize()]}
      weight="medium"
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
}

function ItemDescription({
  className,
  children,
  ...props
}: ItemDescriptionProps) {
  return (
    <Typography
      type={DESCRIPTION_TYPES[useItemSize()]}
      muted
      className={className}
      {...props}
    >
      {children}
    </Typography>
  );
}

function ItemActions({ className, children }: ItemActionsProps) {
  return (
    <Row alignment="center" className={cn("gap-1.5", className)}>
      {children}
    </Row>
  );
}

/**
 * iOS Item: same props as [the web one](./item.tsx), drawn as SwiftUI stacks.
 *
 * `orientation` has no analogue here — a native row is always horizontal and a
 * group always vertical, so `Item.Header` and `Item.Footer`, which only make
 * sense once a row stacks, stay web-only. A dimmed row is `disabled` rather
 * than an `opacity-*` class on `Item.Content`: the modifier has to sit on the
 * row for the press feedback to dim with it.
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
