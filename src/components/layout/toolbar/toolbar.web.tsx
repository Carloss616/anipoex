import { Stack } from "expo-router";
import type { ViewStyle } from "react-native";
import Animated, { type CSSAnimationProperties } from "react-native-reanimated";
import { Row } from "@/components/layout/row";
import { CloseButton } from "@/components/ui/close-button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { noop } from "@/utils/utils";
import type { ToolbarProps } from "./toolbar";
import { labelOf, readToolbar, type ToolbarItem } from "./toolbar-items";

const SPIN: CSSAnimationProperties<ViewStyle> = {
  animationName: { to: { transform: [{ rotate: "360deg" }] } },
  animationDuration: "1s",
  animationTimingFunction: "linear",
  animationIterationCount: "infinite",
};

function ToolbarItemView({
  item,
  tintColor,
  spinning,
}: {
  item: ToolbarItem;
  tintColor?: string;
  spinning?: boolean;
}) {
  const label = labelOf(
    item.props,
    item.kind === "menu" ? "More options" : "Action",
  );
  const iconName = (item.props.icon ??
    (item.kind === "menu" ? "ellipsis-vertical" : undefined)) as IconName;

  const icon =
    iconName == null ? (
      label
    ) : (
      <Icon
        name={iconName}
        size={18}
        color={item.props.tintColor ?? tintColor}
      />
    );

  const trigger = (
    <CloseButton
      disabled={item.props.disabled}
      onPress={item.kind === "button" ? item.props.onPress : undefined}
      accessibilityLabel={label}
    >
      {spinning && item.kind === "button" ? (
        <Animated.View style={SPIN}>{icon}</Animated.View>
      ) : (
        icon
      )}
    </CloseButton>
  );

  if (item.kind === "button") return trigger;

  return (
    <Menu
      items={item.actions.map((action) => ({
        label: action.label,
        icon: action.icon as IconName,
        disabled: action.disabled,
        onPress: action.onPress ?? noop,
      }))}
    >
      {/* `Menu` clones this with the `onPress` that opens it. */}
      {trigger}
    </Menu>
  );
}

/**
 * Maps `Stack.Toolbar` → `Stack.Screen` `headerRight`/`headerLeft` on web,
 * converting `Stack.Toolbar.Button` (and `Menu`) into header controls.
 */
export function Toolbar({ children: toolbar, spinning }: ToolbarProps) {
  const parsed = readToolbar(toolbar);

  if (!parsed || parsed.placement === "bottom") return null;

  const headerSlot = parsed.placement === "left" ? "headerLeft" : "headerRight";

  return (
    <Stack.Screen
      options={{
        [headerSlot]: ({ tintColor }: { tintColor?: string }) => (
          <Row className="gap-4" alignment="center">
            {parsed.items.map((item) => (
              <ToolbarItemView
                key={item.key}
                item={item}
                tintColor={tintColor}
                spinning={spinning}
              />
            ))}
          </Row>
        ),
      }}
    />
  );
}
