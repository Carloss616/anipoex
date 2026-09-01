import { Stack } from "expo-router";
import type { ColorValue } from "react-native";
import { Row } from "@/components/layout/row";
import { Button } from "@/components/ui/button";
import { Host } from "@/components/ui/host";
import { Icon, type IconName } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { noop } from "@/utils/utils";
import type { ToolbarProps } from "./toolbar";
import { labelOf, readToolbar, type ToolbarItem } from "./toolbar-items";

function ToolbarButton({
  icon,
  label,
  disabled,
  tintColor,
  onPress,
}: {
  icon?: unknown;
  label: string;
  disabled?: boolean;
  tintColor?: ColorValue;
  onPress?: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      onPress={onPress}
      colors={tintColor ? { contentColor: tintColor } : undefined}
    >
      {icon == null ? (
        label
      ) : (
        <Icon
          name={icon as IconName}
          size={24}
          accessibilityLabel={label}
          className="text-inherit"
        />
      )}
    </Button>
  );
}

function ToolbarItemView({ item }: { item: ToolbarItem }) {
  if (item.kind === "button") {
    return (
      <ToolbarButton
        icon={item.props.icon}
        label={labelOf(item.props, "Action")}
        disabled={item.props.disabled}
        tintColor={item.props.tintColor}
        onPress={item.props.onPress}
      />
    );
  }

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
      <ToolbarButton
        icon={item.props.icon}
        label={labelOf(item.props, "More options")}
        disabled={item.props.disabled}
        tintColor={item.props.tintColor}
      />
    </Menu>
  );
}

/**
 * Android draws toolbar items as Android Views, so each one can only be tinted
 * one prop at a time and its ripple never follows the app's palette — the ⋮
 * popup needed a patch of its own for that. `asChild` hands the whole header
 * slot over instead: one Compose `Host`, and from there the items are our own
 * `Button` and `Menu`, themed like the rest of the screen for free.
 */
export function Toolbar({ children: toolbar }: ToolbarProps) {
  const parsed = readToolbar(toolbar);

  if (!parsed) return null;
  // `asChild` only replaces a header slot; the bottom toolbar keeps its own.
  if (parsed.placement === "bottom") return toolbar;

  return (
    <Stack.Toolbar placement={parsed.placement} asChild>
      <Host matchContents>
        <Row alignment="center">
          {parsed.items.map((item) => (
            <ToolbarItemView key={item.key} item={item} />
          ))}
        </Row>
      </Host>
    </Stack.Toolbar>
  );
}
