import { Stack } from "expo-router";
import { Button } from "@/components/ui/button";
import { BUTTON_ICON_SIZE, Icon, type IconName } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { noop } from "@/utils/utils";
import type { ToolbarProps } from "./toolbar";
import { labelOf, readToolbar, type ToolbarItem } from "./utils";

function ToolbarItemView({
  item,
  tintColor,
  loading,
}: {
  item: ToolbarItem;
  tintColor?: string;
  loading?: boolean;
}) {
  const label = labelOf(
    item.props,
    item.kind === "menu" ? "More options" : "Action",
  );
  const iconName = (item.props.icon ??
    (item.kind === "menu" ? "ellipsis-vertical" : undefined)) as IconName;
  const isLoading = loading && item.kind === "button" && item.props.disabled;

  const icon =
    iconName == null ? (
      label
    ) : (
      <Icon
        name={iconName}
        size={BUTTON_ICON_SIZE}
        color={item.props.tintColor ?? tintColor}
      />
    );

  const trigger = (
    <Button
      variant="secondary"
      size="icon"
      className="size-9"
      loading={isLoading}
      disabled={item.props.disabled}
      onPress={item.kind === "button" ? item.props.onPress : undefined}
      accessibilityLabel={label}
    >
      {!isLoading && icon}
    </Button>
  );

  if (item.kind === "button") return trigger;

  return (
    <Menu
      items={item.actions.map((action) => ({
        label: action.label,
        icon: action.icon as IconName,
        disabled: action.disabled,
        checked: action.isOn,
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
export function Toolbar({ children: toolbar, loading }: ToolbarProps) {
  const parsed = readToolbar(toolbar);

  if (!parsed || parsed.placement === "bottom") return null;

  const headerSlot = parsed.placement === "left" ? "headerLeft" : "headerRight";

  return (
    <Stack.Screen
      options={{
        [headerSlot]: ({ tintColor }: { tintColor?: string }) =>
          parsed.items.map((item) => (
            <ToolbarItemView
              key={item.key}
              item={item}
              tintColor={tintColor}
              loading={loading}
            />
          )),
      }}
    />
  );
}
