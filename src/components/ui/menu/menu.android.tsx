import CheckIcon from "@expo/material-symbols/check.xml";
import { DropdownMenu, DropdownMenuItem } from "@expo/ui/jetpack-compose";
import { cloneElement, useState } from "react";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Dialog } from "../dialog";
import { Icon } from "../icon";
import { Typography } from "../typography";
import type { MenuProps } from "./menu";
import { useMenuDialogState } from "./use-menu-dialog";

/**
 * Android Menu: a Material `DropdownMenu`. Its trigger stays in the React
 * Native surface, so the trigger element keeps its own look and only has to
 * hand over its `onPress`.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/jetpack-compose/dropdownmenu/
 */
export function Menu({ items, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const { rows, pending, close } = useMenuDialogState(items);
  const destructive = useThemeM3Colors("destructive");

  return (
    <>
      <DropdownMenu expanded={open} onDismissRequest={() => setOpen(false)}>
        <DropdownMenu.Trigger>
          {cloneElement(children, { onPress: () => setOpen(true) })}
        </DropdownMenu.Trigger>
        <DropdownMenu.Items>
          {rows.map((item) => (
            <DropdownMenuItem
              key={item.label}
              enabled={!item.disabled}
              elementColors={
                item.destructive
                  ? { textColor: destructive.primary }
                  : undefined
              }
              onClick={() => {
                setOpen(false);
                item.onPress();
              }}
            >
              <DropdownMenuItem.Text>
                <Typography className="text-inherit">{item.label}</Typography>
              </DropdownMenuItem.Text>
              {item.icon && (
                <DropdownMenuItem.LeadingIcon>
                  <Icon name={item.icon} size={24} />
                </DropdownMenuItem.LeadingIcon>
              )}
              {item.checked && (
                <DropdownMenuItem.TrailingIcon>
                  <Icon name={CheckIcon} size={24} />
                </DropdownMenuItem.TrailingIcon>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenu.Items>
      </DropdownMenu>

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
