import { Stack } from "expo-router";
import { Button } from "panelui-web/button";
import { Icon, type IconName } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { noop } from "@/utils/utils";
import type { ToolbarProps } from "./toolbar";
import { labelOf, readToolbar, type ToolbarItem } from "./utils";

function ToolbarItemView({
  item,
  loading,
}: {
  item: ToolbarItem;
  loading?: boolean;
}) {
  const label = labelOf(
    item.props,
    item.kind === "menu" ? "More options" : "Action",
  );
  const iconName = (item.props.icon ??
    (item.kind === "menu" ? "ellipsis-vertical" : undefined)) as IconName;
  const isLoading = loading && item.kind === "button" && item.props.disabled;

  const icon = iconName == null ? label : <Icon name={iconName} />;

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      shape="pill"
      loading={isLoading}
      disabled={item.props.disabled}
      onClick={item.kind === "button" ? item.props.onPress : undefined}
      aria-label={label}
    >
      {icon}
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

/** Puts a `Stack.Toolbar`'s buttons and menus in a header slot. */
export function Toolbar({ children: toolbar, loading }: ToolbarProps) {
  const parsed = readToolbar(toolbar);

  if (!parsed || parsed.placement === "bottom") return null;

  const headerSlot = parsed.placement === "left" ? "headerLeft" : "headerRight";

  return (
    <Stack.Screen
      options={{
        [headerSlot]: () =>
          parsed.items.map((item) => (
            <ToolbarItemView key={item.key} item={item} loading={loading} />
          )),
      }}
    />
  );
}
