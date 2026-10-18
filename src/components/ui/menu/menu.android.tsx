import { DropdownMenu, DropdownMenuItem } from "@expo/ui/jetpack-compose";
import { cloneElement, useState } from "react";
import { Text } from "@/components/native/jetpack-compose/text";
import { useThemeM3Colors } from "@/hooks/use-theme/use-theme.android";
import { Dialog } from "../dialog";
import { Icon, Icons } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import type { MenuProps } from "./menu";

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
  const m3 = useThemeM3Colors();

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
                item.destructive ? { textColor: m3.error } : undefined
              }
              onClick={() => {
                setOpen(false);
                item.onPress();
              }}
            >
              <DropdownMenuItem.Text>
                <Text style={{ typography: "labelLarge" }}>{item.label}</Text>
              </DropdownMenuItem.Text>
              {item.icon && (
                <DropdownMenuItem.LeadingIcon>
                  <Icon name={item.icon} size={24} />
                </DropdownMenuItem.LeadingIcon>
              )}
              {item.checked && (
                <DropdownMenuItem.TrailingIcon>
                  <Icon name={Icons.check} size={24} />
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
