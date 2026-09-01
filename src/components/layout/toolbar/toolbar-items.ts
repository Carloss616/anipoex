import { Stack, type StackToolbarProps } from "expo-router";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type ToolbarButtonProps = ComponentProps<typeof Stack.Toolbar.Button>;
export type ToolbarMenuProps = ComponentProps<typeof Stack.Toolbar.Menu>;
type ToolbarMenuActionProps = ComponentProps<typeof Stack.Toolbar.MenuAction>;

/** A `Stack.Toolbar.MenuAction` with its label already resolved. */
export interface ToolbarAction {
  label: string;
  icon?: ToolbarMenuActionProps["icon"];
  disabled?: boolean;
  onPress?: () => void;
}

export type ToolbarItem =
  | { kind: "button"; key: string; props: ToolbarButtonProps }
  | {
      kind: "menu";
      key: string;
      props: ToolbarMenuProps;
      actions: ToolbarAction[];
    };

export interface Toolbar {
  placement: NonNullable<StackToolbarProps["placement"]>;
  items: ToolbarItem[];
}

function warn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`Toolbar: ${message}`);
  }
}

function isToolbarButton(
  child: ReactNode,
): child is ReactElement<ToolbarButtonProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.Button;
}

function isToolbarMenu(
  child: ReactNode,
): child is ReactElement<ToolbarMenuProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.Menu;
}

function isToolbarMenuAction(
  child: ReactNode,
): child is ReactElement<ToolbarMenuActionProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.MenuAction;
}

/** Toolbar items are icon-only, so their label is what a screen reader gets. */
function labelOf(
  props: { accessibilityLabel?: string; children?: ReactNode },
  fallback: string,
) {
  if (props.accessibilityLabel) return props.accessibilityLabel;
  const { children } = props;
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  return fallback;
}

function toActions(children: ReactNode): ToolbarAction[] {
  return Children.toArray(children)
    .filter(isToolbarMenuAction)
    .filter((action) => !action.props.hidden)
    .map((action, index) => ({
      label: labelOf(action.props, `Action ${index + 1}`),
      icon: action.props.icon,
      disabled: action.props.disabled,
      onPress: action.props.onPress,
    }));
}

/**
 * Reads a `<Stack.Toolbar>` element into a flat list, so a platform that can't
 * use the native toolbar can draw the same items with its own components.
 * Anything but a `Button` or a `Menu` is dropped — `Spacer`, `View` and
 * `SearchBarSlot` only mean something to the platform toolbar.
 */
export function readToolbar(toolbar: ReactNode): Toolbar | null {
  if (!isValidElement<StackToolbarProps>(toolbar)) {
    warn("expected a <Stack.Toolbar> element; received something else.");
    return null;
  }

  const { placement = "bottom", children } = toolbar.props;

  const items = Children.toArray(children).flatMap<ToolbarItem>(
    (child, index) => {
      if (isToolbarButton(child)) {
        if (child.props.hidden) return [];
        return {
          kind: "button",
          key: String(child.key ?? `button-${index}`),
          props: child.props,
        };
      }
      if (isToolbarMenu(child)) {
        if (child.props.hidden) return [];
        return {
          kind: "menu",
          key: String(child.key ?? `menu-${index}`),
          props: child.props,
          actions: toActions(child.props.children),
        };
      }
      warn(`dropping a child that is not a Button or a Menu.`);
      return [];
    },
  );

  return { placement, items };
}

export { labelOf };
