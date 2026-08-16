import { Stack } from "expo-router";
import { Menu } from "panelui-native/components/menu";
import {
  Children,
  type ComponentProps,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { View, type ViewStyle } from "react-native";
import Animated, { type CSSAnimationProperties } from "react-native-reanimated";
import { CloseButton } from "@/components/ui/close-button";
import { Icon, type IconName } from "@/components/ui/icon";
import type { WebToolbarOptions } from "./with-web-toolbar";

type ToolbarProps = ComponentProps<typeof Stack.Toolbar>;
type ButtonProps = ComponentProps<typeof Stack.Toolbar.Button>;
type MenuProps = ComponentProps<typeof Stack.Toolbar.Menu>;
type MenuActionProps = ComponentProps<typeof Stack.Toolbar.MenuAction>;

const SPIN: CSSAnimationProperties<ViewStyle> = {
  animationName: { to: { transform: [{ rotate: "360deg" }] } },
  animationDuration: "1s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
};

function warn(message: string) {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`withWebToolbar: ${message}`);
  }
}

function isToolbarButton(child: ReactNode): child is ReactElement<ButtonProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.Button;
}

function isToolbarMenu(child: ReactNode): child is ReactElement<MenuProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.Menu;
}

function isToolbarMenuAction(
  child: ReactNode,
): child is ReactElement<MenuActionProps> {
  return isValidElement(child) && child.type === Stack.Toolbar.MenuAction;
}

function labelFromChildren(children: ReactNode): string | undefined {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  return undefined;
}

function ToolbarButton({
  props,
  tintColor,
  spinning,
}: {
  props: ButtonProps;
  tintColor?: string;
  spinning?: boolean;
}) {
  if (props.hidden) return null;

  const label =
    props.accessibilityLabel ?? labelFromChildren(props.children) ?? "Action";

  const icon =
    props.icon != null ? (
      <Icon
        name={props.icon as IconName}
        size={18}
        color={props.tintColor ?? tintColor}
      />
    ) : (
      label
    );

  return (
    <CloseButton
      disabled={props.disabled}
      onPress={props.onPress}
      accessibilityLabel={label}
    >
      {spinning ? <Animated.View style={SPIN}>{icon}</Animated.View> : icon}
    </CloseButton>
  );
}

function ToolbarMenu({
  props,
  tintColor,
}: {
  props: MenuProps;
  tintColor?: string;
}) {
  if (props.hidden) return null;

  const label = props.accessibilityLabel ?? "More options";
  const actions = Children.toArray(props.children).filter(isToolbarMenuAction);

  return (
    <Menu>
      <Menu.Trigger>
        <CloseButton disabled={props.disabled} accessibilityLabel={label}>
          <Icon
            name={(props.icon as IconName) ?? "ellipsis-vertical"}
            size={18}
            color={props.tintColor ?? tintColor}
          />
        </CloseButton>
      </Menu.Trigger>
      <Menu.Content placement="bottom" align="end">
        {actions.map((action, index) => {
          if (action.props.hidden) return null;
          const actionLabel =
            labelFromChildren(action.props.children) ?? `Action ${index + 1}`;

          return (
            <Menu.Item
              key={action.key ?? actionLabel}
              disabled={action.props.disabled}
              onPress={action.props.onPress}
              icon={
                action.props.icon == null ? undefined : (
                  <Icon
                    name={action.props.icon as IconName}
                    size={16}
                    color={tintColor}
                  />
                )
              }
            >
              {actionLabel}
            </Menu.Item>
          );
        })}
      </Menu.Content>
    </Menu>
  );
}

function mapToolbarChildren(
  children: ReactNode,
  tintColor?: string,
  spinning?: boolean,
) {
  return Children.toArray(children).flatMap((child, index) => {
    if (isToolbarButton(child)) {
      return (
        <ToolbarButton
          key={child.key ?? `button-${index}`}
          props={child.props}
          tintColor={tintColor}
          spinning={spinning}
        />
      );
    }
    if (isToolbarMenu(child)) {
      return (
        <ToolbarMenu
          key={child.key ?? `menu-${index}`}
          props={child.props}
          tintColor={tintColor}
        />
      );
    }
    warn(
      "only <Stack.Toolbar.Button> and <Stack.Toolbar.Menu> are mapped on web; dropping a child.",
    );
    return [];
  });
}

/**
 * Maps `Stack.Toolbar` → `Stack.Screen` `headerRight`/`headerLeft` on web,
 * converting `Stack.Toolbar.Button` (and `Menu`) into header controls.
 */
export function withWebToolbar(
  toolbar: ReactElement<ToolbarProps>,
  options?: WebToolbarOptions,
): ReactElement | null {
  if (!isValidElement(toolbar) || toolbar.type !== Stack.Toolbar) {
    warn("expected a <Stack.Toolbar> element; received something else.");
    return null;
  }

  const { placement = "bottom", children } = toolbar.props;

  if (placement === "bottom") return null;

  const headerSlot = placement === "left" ? "headerLeft" : "headerRight";

  return (
    <Stack.Screen
      options={{
        [headerSlot]: ({ tintColor }: { tintColor?: string }) => (
          <View className="flex-row items-center gap-1">
            {mapToolbarChildren(children, tintColor, options?.spinning)}
          </View>
        ),
      }}
    />
  );
}
