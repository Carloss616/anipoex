import { cloneElement, type ReactNode, useState } from "react";
import { DropdownMenu } from "@/components/native/jetpack-compose/dropdown-menu";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Dialog } from "../dialog";
import { BUTTON_ICON_SIZE, Icon } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import type { ContextMenuProps, MenuProps } from "./menu";
import { toSegments } from "./utils";

/**
 * M3 Expressive dropdown menu (`modules/dropdown-menu`): each group, submenu or run of plain rows
 * is a rounded segment. The trigger keeps its own look and only hands over its
 * `onPress`.
 */
export function Menu({ items, children, selection = "radio" }: MenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownFor
      items={items}
      selection={selection}
      open={open}
      setOpen={setOpen}
    >
      {cloneElement(children, { onPress: () => setOpen(true) })}
    </DropdownFor>
  );
}

/** Compose has no context menu: this menu, opened by a long press, or a tap where it has none. */
export function ContextMenu({
  items,
  children,
  selection = "radio",
}: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <DropdownFor
      items={items}
      selection={selection}
      open={open}
      setOpen={setOpen}
    >
      {cloneElement(children, {
        onLongPress: () => setOpen(true),
        onPress: children.props.onPress ?? (() => setOpen(true)),
      })}
    </DropdownFor>
  );
}

function DropdownFor({
  items,
  selection,
  open,
  setOpen,
  children,
}: Required<Pick<MenuProps, "items" | "selection">> & {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The trigger, already wired to open it. */
  children: ReactNode;
}) {
  const { rows, pending, close } = useMenuDialogState(items);
  const segments = toSegments(rows);
  const m3 = useThemeM3Colors();

  return (
    <>
      <DropdownMenu expanded={open} onDismiss={() => setOpen(false)}>
        <DropdownMenu.Trigger>{children}</DropdownMenu.Trigger>
        {segments.map((segment, index) => {
          const mode = segment.selection ?? selection;
          return (
            <DropdownMenu.Group
              key={segment.heading ?? index}
              index={index}
              count={segments.length}
              heading={segment.heading}
            >
              {segment.items.map((item, row) => (
                <DropdownMenu.Item
                  key={item.label}
                  label={item.label}
                  index={row}
                  count={segment.items.length}
                  checked={item.checked}
                  selection={mode}
                  enabled={!item.disabled}
                  destructive={item.destructive}
                  onPress={() => {
                    // A checkbox row stays open so several can be toggled.
                    if (item.checked === undefined || mode === "radio") {
                      setOpen(false);
                    }
                    item.onPress();
                  }}
                >
                  {item.icon && (
                    <Icon
                      name={item.icon}
                      size={BUTTON_ICON_SIZE}
                      color={item.destructive ? m3.error : "inherit"}
                    />
                  )}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Group>
          );
        })}
      </DropdownMenu>

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
