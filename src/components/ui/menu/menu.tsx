import { Menu as PanelMenu } from "panelui-native/components/menu";
import type { PopoverAlign } from "panelui-native/components/popover";
import type { ReactElement } from "react";
import { Dialog, type DialogProps } from "../dialog";
import { Icon, type IconName } from "../icon";
import { useMenuDialogState } from "./use-menu-dialog";

export type MenuItemDialogConfig = Pick<
  DialogProps,
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
export type MenuItem = MenuItemBase &
  (
    | { onPressMode?: "default"; dialogConfig?: never }
    | { onPressMode: "dialog"; dialogConfig: MenuItemDialogConfig }
  );

export interface MenuProps {
  items: MenuItem[];
  /** The element the menu hangs off. Must accept `onPress` — it is what opens the menu. */
  children: ReactElement<{ onPress?: (...args: unknown[]) => void }>;
  /** @platform web */
  align?: PopoverAlign;
}

function RowItem({
  destructive,
  checked,
  disabled,
  onPress,
  label,
  icon,
}: MenuItem) {
  const variant = destructive ? "destructive" : undefined;

  if (checked !== undefined) {
    return (
      <PanelMenu.CheckboxItem
        checked={checked}
        disabled={disabled}
        variant={variant}
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

/**
 * A popup menu, natively rendered per platform.
 *
 * The rows are data rather than children because the native menus underneath
 * only take a flat action list — a `ReactNode` label or icon has nowhere to go
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
        <PanelMenu.Content align={align}>
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
          destructive={pending.destructive}
          onConfirm={pending.onPress}
        />
      )}
    </>
  );
}
