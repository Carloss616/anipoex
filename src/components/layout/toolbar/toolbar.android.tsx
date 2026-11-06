import { IconButton, TextButton } from "@expo/ui/jetpack-compose";
import { Stack } from "expo-router";
import type { ColorValue } from "react-native";
import { Text } from "@/components/native/jetpack-compose/text";
import { Icon, type IconName } from "@/components/ui/icon";
import { Menu } from "@/components/ui/menu";
import { noop } from "@/utils/utils";
import type { ToolbarProps } from "./toolbar";
import { labelOf, readToolbar, type ToolbarItem } from "./utils";

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
  // Always an object: Compose can't reset `colors` to null.
  const colors = { contentColor: tintColor };

  if (icon == null) {
    return (
      <TextButton enabled={!disabled} onClick={onPress} colors={colors}>
        <Text style={{ typography: "labelLarge" }}>{label}</Text>
      </TextButton>
    );
  }

  return (
    <IconButton enabled={!disabled} onClick={onPress} colors={colors}>
      <Icon
        name={icon as IconName}
        accessibilityLabel={label}
        color="inherit"
      />
    </IconButton>
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
        checked: action.isOn,
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
 * Puts a `Stack.Toolbar`'s buttons and menus in the header's actions: the
 * Android header is an M3 app bar in Compose (`header.android.tsx`), so the
 * items are M3's `IconButton` and our `Menu`, themed like the rest of the screen.
 */
export function Toolbar({ children: toolbar }: ToolbarProps) {
  const parsed = readToolbar(toolbar);

  if (!parsed) return null;
  // Only the header's slots are redrawn; the bottom toolbar keeps its own.
  if (parsed.placement === "bottom") return toolbar;

  const headerSlot = parsed.placement === "left" ? "headerLeft" : "headerRight";

  return (
    <Stack.Screen
      options={{
        [headerSlot]: () =>
          parsed.items.map((item) => (
            <ToolbarItemView key={item.key} item={item} />
          )),
      }}
    />
  );
}
