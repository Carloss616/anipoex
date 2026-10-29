import { cn } from "panelui-native/utils/cn";
import { Menu as PanelMenu } from "panelui-web/menu";
import {
  cloneElement,
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  useState,
} from "react";
import { Dialog, type DialogProps } from "../dialog";
import { Icon, type IconName } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import { isGroup, isSubmenu } from "./utils";

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
  /** Its checked rows; the menu's when left out. */
  selection?: MenuSelection;
}

/**
 * How checked rows behave: `radio` picks one of them and closes, `checkbox`
 * toggles each and stays open. Native menus show a checkmark either way.
 */
export type MenuSelection = "radio" | "checkbox";

/**
 * Rows that belong together, under an optional heading: `Menu.Group` and
 * `Menu.GroupLabel` on web, a `Section` on iOS. Android lists the heading as a
 * disabled row.
 */
export interface MenuGroup {
  heading?: string;
  items: MenuAction[];
}

export type MenuItem = MenuAction | MenuSubmenu | MenuGroup;

export interface MenuProps {
  items: MenuItem[];
  /**
   * The element the menu hangs off. Native: it must accept `onPress`, and
   * `onLongPress` with `onPrimaryAction`. Web: a DOM button such as
   * panelui-web's `Button`, which takes the trigger's handlers and ref.
   */
  children: ReactElement<{
    onPress?: (event?: PressEvent) => void;
    onLongPress?: (event?: PressEvent) => void;
  }>;
  /** When set, a tap runs it and a long press (a right-click on web) opens the menu. Keep it set while the trigger shows: unset, the menu moves back to the tap, so tap and hold swap. */
  onPrimaryAction?: () => void;
  /** @platform web */
  align?: "start" | "center" | "end";
  /** @default "radio" */
  selection?: MenuSelection;
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

const isPick = (item: MenuItem): item is MenuAction =>
  !("items" in item) && item.checked !== undefined;

/** The rows, with a radio menu's checked ones joined into one group where the first sits. */
function Rows({
  rows,
  selection,
}: {
  rows: MenuItem[];
  selection: MenuSelection;
}) {
  const picks = selection === "radio" ? rows.filter(isPick) : [];
  const group = (
    <PanelMenu.RadioGroup
      key="picks"
      value={picks.find((pick) => pick.checked)?.label ?? null}
      onValueChange={(label) =>
        picks.find((pick) => pick.label === label)?.onPress()
      }
    >
      {picks.map((pick) => (
        <PanelMenu.RadioItem
          key={pick.label}
          value={pick.label}
          className={ROW}
          disabled={pick.disabled}
          closeOnClick
        >
          <RowIcon name={pick.icon} />
          {pick.label}
        </PanelMenu.RadioItem>
      ))}
    </PanelMenu.RadioGroup>
  );

  return rows.map((item) => {
    if (item === picks[0]) return group;
    if (picks.includes(item as MenuAction)) return null;
    return (
      <RowItem
        key={"label" in item ? item.label : `group-${item.heading}`}
        item={item}
        selection={selection}
      />
    );
  });
}

function RowItem({
  item,
  selection,
}: {
  item: MenuItem;
  selection: MenuSelection;
}) {
  if (isGroup(item)) {
    return (
      <PanelMenu.Group>
        {item.heading && (
          <PanelMenu.GroupLabel>{item.heading}</PanelMenu.GroupLabel>
        )}
        <Rows rows={item.items} selection={selection} />
      </PanelMenu.Group>
    );
  }
  if (!isSubmenu(item)) return <ActionItem {...item} />;

  return (
    <PanelMenu.Sub>
      <PanelMenu.SubTrigger className={ROW} disabled={item.disabled}>
        <RowIcon name={item.icon} />
        {item.label}
      </PanelMenu.SubTrigger>
      <PanelMenu.SubContent>
        <Rows rows={item.items} selection={item.selection ?? selection} />
      </PanelMenu.SubContent>
    </PanelMenu.Sub>
  );
}

/** The trigger's child with the click given to `onPrimaryAction` and the menu moved to a right-click. */
function PrimaryTrigger({
  child,
  onPrimaryAction,
  onOpen,
}: {
  child: MenuProps["children"];
  onPrimaryAction: () => void;
  onOpen: (event: MouseEvent<Element>) => void;
}) {
  return cloneElement(child as ReactElement<HTMLAttributes<Element>>, {
    onClick: onPrimaryAction,
    onContextMenu: (event) => {
      event.preventDefault();
      onOpen(event);
    },
  });
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
  selection = "radio",
}: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);
  const [open, setOpen] = useState(false);
  // Kept after closing, so the menu animates out where it opened.
  const [anchor, setAnchor] = useState<Element | null>(null);

  const openAt = (event: MouseEvent<Element>) => {
    setAnchor(event.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <PanelMenu open={open} onOpenChange={setOpen}>
        {onPrimaryAction ? (
          <PrimaryTrigger
            child={children}
            onPrimaryAction={onPrimaryAction}
            onOpen={openAt}
          />
        ) : (
          <PanelMenu.Trigger render={children} />
        )}
        <PanelMenu.Content
          // A right-click opens it without a Menu.Trigger to anchor to.
          anchor={onPrimaryAction ? anchor : undefined}
          finalFocus={
            onPrimaryAction ? () => anchor as HTMLElement | null : undefined
          }
          align={align}
          className={cn("max-w-72", items.some(isSubmenu) && "min-w-56")}
        >
          <Rows rows={rows} selection={selection} />
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
