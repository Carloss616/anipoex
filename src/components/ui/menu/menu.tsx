import {
  type MenuItemVariant,
  Menu as PanelMenu,
} from "panelui-native/components/menu";
import type { PopoverAlign } from "panelui-native/components/popover";
import { cn } from "panelui-native/utils/cn";
import { cloneElement, type ReactElement, useState } from "react";
import { View, type ViewProps } from "react-native";
import { Dialog, type DialogProps } from "../dialog";
import { Icon, type IconName } from "../icon";
import { OverlayScope } from "../overlay-scope";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import { isSubmenu } from "./utils";

// The panel fits its rows when it opens, before a submenu adds wider ones.
const SUBMENU_MIN_WIDTH = 224;
// A long row (a full manga title) wraps instead of stretching the panel.
const MAX_WIDTH = 288;

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
  /** The element the menu hangs off. Must accept `onPress` — it is what opens the menu — and `onLongPress` when `onPrimaryAction` is set. */
  children: ReactElement<{
    onPress?: (...args: unknown[]) => void;
    onLongPress?: (...args: unknown[]) => void;
  }>;
  /** When set, a tap runs it and a long press (or a right-click on web) opens the menu. Keep it set while the trigger shows: unset, the menu moves back to the tap, so tap and hold swap. */
  onPrimaryAction?: () => void;
  /** @platform web */
  align?: PopoverAlign;
}

const HOVER_VARIANTS = {
  default: "hover:bg-accent",
  destructive: "hover:bg-destructive-subtle",
} satisfies Record<MenuItemVariant, string>;

function ActionItem({
  destructive,
  checked,
  disabled,
  onPress,
  label,
  icon,
}: MenuAction) {
  const variant = destructive ? "destructive" : "default";

  if (checked !== undefined) {
    return (
      <PanelMenu.CheckboxItem
        checked={checked}
        disabled={disabled}
        variant={variant}
        data-variant={variant}
        // Every checked row here picks one of several, and native menus close on a pick.
        closeOnSelect
        onCheckedChange={onPress}
        className={cn("transition-colors", HOVER_VARIANTS[variant])}
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
      data-variant={variant}
      onSelect={onPress}
      className={cn("transition-colors", HOVER_VARIANTS[variant])}
    >
      {label}
    </PanelMenu.Item>
  );
}

function RowItem(item: MenuItem) {
  if (!isSubmenu(item)) return <ActionItem {...item} />;
  return <SubmenuItem {...item} />;
}

function SubmenuItem(item: MenuSubmenu) {
  const [open, setOpen] = useState(false);

  return (
    <PanelMenu.Sub open={open} onOpenChange={setOpen}>
      <PanelMenu.SubTrigger
        icon={item.icon ? <Icon name={item.icon} size={16} /> : undefined}
        disabled={item.disabled}
        className={cn("transition-colors", HOVER_VARIANTS.default)}
      >
        {item.label}
      </PanelMenu.SubTrigger>
      <PanelMenu.SubContent>
        {/* Collapsed rows stay laid out at zero height, where arrow
            keys would still reach them. */}
        {open &&
          item.items.map((row) => <ActionItem key={row.label} {...row} />)}
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
/** The trigger's child with the tap given to `onPrimaryAction` and the menu's `onPress` moved to a long press or right-click. */
function PrimaryTrigger({
  child,
  onPrimaryAction,
  onPress,
}: {
  child: MenuProps["children"];
  onPrimaryAction: () => void;
  onPress?: () => void;
}) {
  // react-native-web forwards the DOM event its types don't list.
  const rightClick = {
    onContextMenu: (event: { preventDefault: () => void }) => {
      event.preventDefault();
      onPress?.();
    },
  } as ViewProps;
  return (
    <View {...rightClick}>
      {cloneElement(child, { onPress: onPrimaryAction, onLongPress: onPress })}
    </View>
  );
}

export function Menu({
  items,
  children,
  align = "end",
  onPrimaryAction,
}: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PanelMenu open={open} onOpenChange={setOpen}>
        <PanelMenu.Trigger>
          {onPrimaryAction ? (
            <PrimaryTrigger
              child={children}
              onPrimaryAction={onPrimaryAction}
            />
          ) : (
            children
          )}
        </PanelMenu.Trigger>
        <PanelMenu.Content
          align={align}
          minWidth={items.some(isSubmenu) ? SUBMENU_MIN_WIDTH : undefined}
          style={{ maxWidth: MAX_WIDTH }}
          // RNW's flex-shrink: 0 overflowed PanelUI's capped box: the rows never scrolled.
          className="min-h-0 shrink"
        >
          <OverlayScope
            arrows="vertical"
            onClose={() => setOpen(false)}
            className="flex flex-col gap-1.5"
          >
            {rows.map((item) => (
              <RowItem key={item.label} {...item} />
            ))}
          </OverlayScope>
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
