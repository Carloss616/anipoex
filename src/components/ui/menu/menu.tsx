import { Menu as PanelMenu } from "panelui-native/components/menu";
import type { PopoverAlign } from "panelui-native/components/popover";
import type { ReactElement } from "react";
import { Dialog, type DialogProps } from "../dialog";
import { Icon, type IconName } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import { isSubmenu } from "./utils";

// The panel fits its rows when it opens, before a submenu adds wider ones.
const SUBMENU_MIN_WIDTH = 224;

// The single-confirm form: a menu row confirms one action.
export type MenuItemDialogConfig = Pick<
  Extract<DialogProps, { confirmLabel: string }>,
  "title" | "description" | "confirmLabel"
>;

interface MenuItemBase {
  label: string;
  /** Runs on select — or on confirm, when `onPressMode` is `"dialog"`. */
  onPress: () => void;
  /** Build it with `Icon.select` — a bare name only resolves on one platform. */
  icon?: IconName;
  /** Colors the row, and the dialog's confirm button along with it. */
  destructive?: boolean;
  disabled?: boolean;
  /** Draws a checkmark. The row still reports through `onPress`. */
  checked?: boolean;
}

/**
 * A row is either a plain action or one that confirms through a dialog first.
 * The menu owns that dialog's open state, so a caller never wires one up.
 */
export type MenuAction = MenuItemBase &
  (
    | { onPressMode?: "default"; dialogConfig?: never }
    | { onPressMode: "dialog"; dialogConfig: MenuItemDialogConfig }
  );

/**
 * A row that opens more rows, one level deep: nested on iOS and web. Android's
 * dropdown has no submenus, so there its rows join the list as `Label: row`.
 */
export interface MenuSubmenu {
  label: string;
  icon?: IconName;
  disabled?: boolean;
  items: MenuAction[];
}

export type MenuItem = MenuAction | MenuSubmenu;

export interface MenuProps {
  items: MenuItem[];
  /** The element the menu hangs off. Must accept `onPress` — it is what opens the menu. */
  children: ReactElement<{ onPress?: (...args: unknown[]) => void }>;
  /** @platform web */
  align?: PopoverAlign;
}

function ActionItem({
  destructive,
  checked,
  disabled,
  onPress,
  label,
  icon,
}: MenuAction) {
  const variant = destructive ? "destructive" : undefined;

  if (checked !== undefined) {
    return (
      <PanelMenu.CheckboxItem
        checked={checked}
        disabled={disabled}
        variant={variant}
        // Every checked row here picks one of several, and native menus close on a pick.
        closeOnSelect
        onCheckedChange={onPress}
      >
        {label}
      </PanelMenu.CheckboxItem>
    );
  }

  return (
    <PanelMenu.Item
      icon={icon ? <Icon name={icon} size={16} /> : undefined}
      disabled={disabled}
      variant={variant}
      onSelect={onPress}
    >
      {label}
    </PanelMenu.Item>
  );
}

function RowItem(item: MenuItem) {
  if (!isSubmenu(item)) return <ActionItem {...item} />;

  return (
    <PanelMenu.Sub>
      <PanelMenu.SubTrigger
        icon={item.icon ? <Icon name={item.icon} size={16} /> : undefined}
        disabled={item.disabled}
      >
        {item.label}
      </PanelMenu.SubTrigger>
      <PanelMenu.SubContent>
        {item.items.map((row) => (
          <ActionItem key={row.label} {...row} />
        ))}
      </PanelMenu.SubContent>
    </PanelMenu.Sub>
  );
}

/**
 * A popup menu, natively rendered per platform.
 *
 * The rows are data rather than children because the native menus underneath
 * only take action rows — a `ReactNode` label or icon has nowhere to go
 * there. `description`/`shortcut`/`trailing` are absent for the same reason.
 *
 * @see https://panelui.dev/docs/components/menu
 */
export function Menu({ items, children, align = "end" }: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);

  return (
    <>
      <PanelMenu>
        <PanelMenu.Trigger>{children}</PanelMenu.Trigger>
        <PanelMenu.Content
          align={align}
          minWidth={items.some(isSubmenu) ? SUBMENU_MIN_WIDTH : undefined}
        >
          {rows.map((item) => (
            <RowItem key={item.label} {...item} />
          ))}
        </PanelMenu.Content>
      </PanelMenu>

      {pending?.onPressMode === "dialog" && (
        <Dialog
          {...pending.dialogConfig}
          open
          onOpenChange={(next) => {
            if (!next) close();
          }}
          role={pending.destructive ? "destructive" : undefined}
          onConfirm={pending.onPress}
        />
      )}
    </>
  );
}
