import { cn } from "panelui-native/utils/cn";
import { Menu as PanelMenu } from "panelui-web/menu";
import { cloneElement, type ReactElement, useState } from "react";
import { View, type ViewProps } from "react-native";
import { Dialog, type DialogProps } from "../dialog";
import { Icon, type IconName } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import { isSubmenu } from "./utils";

// panelui-web rows don't wrap: a long title breaks lines within max-w-72.
const ROW = "whitespace-normal";

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
    onPress?: (event?: PressEvent) => void;
    onLongPress?: (event?: PressEvent) => void;
  }>;
  /** When set, a tap runs it and a long press (or a right-click on web) opens the menu. Keep it set while the trigger shows: unset, the menu moves back to the tap, so tap and hold swap. */
  onPrimaryAction?: () => void;
  /** @platform web */
  align?: "start" | "center" | "end";
}

type PressEvent = { currentTarget?: unknown; preventDefault?: () => void };

function RowIcon({ name }: { name?: IconName }) {
  return name ? <Icon name={name} size={16} /> : null;
}

function ActionItem({
  destructive,
  checked,
  disabled,
  onPress,
  label,
  icon,
}: MenuAction) {
  if (checked !== undefined) {
    return (
      <PanelMenu.CheckboxItem
        className={ROW}
        checked={checked}
        disabled={disabled}
        // Every checked row here picks one of several, and native menus close on a pick.
        closeOnClick
        onCheckedChange={onPress}
      >
        <RowIcon name={icon} />
        {label}
      </PanelMenu.CheckboxItem>
    );
  }

  return (
    <PanelMenu.Item
      className={ROW}
      disabled={disabled}
      variant={destructive ? "destructive" : "default"}
      onClick={onPress}
    >
      <RowIcon name={icon} />
      {label}
    </PanelMenu.Item>
  );
}

function RowItem(item: MenuItem) {
  if (!isSubmenu(item)) return <ActionItem {...item} />;

  return (
    <PanelMenu.Sub>
      <PanelMenu.SubTrigger className={ROW} disabled={item.disabled}>
        <RowIcon name={item.icon} />
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

/** The trigger's child with the tap given to `onPrimaryAction` and the menu moved to a long press or right-click. */
function PrimaryTrigger({
  child,
  onPrimaryAction,
  onOpen,
}: {
  child: MenuProps["children"];
  onPrimaryAction: () => void;
  onOpen: (event?: PressEvent) => void;
}) {
  // react-native-web forwards the DOM event its types don't list.
  const rightClick = {
    onContextMenu: (event: PressEvent) => {
      event.preventDefault?.();
      onOpen(event);
    },
  } as ViewProps;
  return (
    <View {...rightClick}>
      {cloneElement(child, { onPress: onPrimaryAction, onLongPress: onOpen })}
    </View>
  );
}

/**
 * A popup menu, natively rendered per platform.
 *
 * The rows are data rather than children because the native menus underneath
 * only take action rows — a `ReactNode` label or icon has nowhere to go
 * there. `description`/`shortcut`/`trailing` are absent for the same reason.
 *
 * @see https://panelui.dev/docs/web/components/menu
 */
export function Menu({
  items,
  children,
  align = "end",
  onPrimaryAction,
}: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);
  const [open, setOpen] = useState(false);
  // Kept after closing, so the menu animates out where it opened.
  const [anchor, setAnchor] = useState<Element | null>(null);

  // The child stays the trigger: its own press opens the menu at it.
  const openAt = (event?: PressEvent) => {
    setAnchor((event?.currentTarget as Element | undefined) ?? null);
    setOpen(true);
  };

  return (
    <>
      {onPrimaryAction ? (
        <PrimaryTrigger
          child={children}
          onPrimaryAction={onPrimaryAction}
          onOpen={openAt}
        />
      ) : (
        cloneElement(children, { onPress: openAt })
      )}

      <PanelMenu open={open} onOpenChange={setOpen}>
        <PanelMenu.Content
          anchor={anchor}
          // With no Menu.Trigger, Base UI doesn't know where focus came from.
          finalFocus={() => anchor as HTMLElement | null}
          align={align}
          className={cn("max-w-72", items.some(isSubmenu) && "min-w-56")}
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
