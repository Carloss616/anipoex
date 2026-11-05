import {
  Button,
  Section,
  ContextMenu as SwiftUIContextMenu,
  Menu as SwiftUIMenu,
  Toggle,
} from "@expo/ui/swift-ui";
import { disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
import type { JSX } from "react";
import { Dialog } from "../dialog";
import { EnsureHost } from "../host";
import { sfSymbol } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import type { ContextMenuProps, MenuAction, MenuItem, MenuProps } from "./menu";
import { isGroup, isSubmenu } from "./utils";

function actionRow(item: MenuAction) {
  const modifiers = item.disabled ? [disabledModifier(true)] : undefined;

  return item.checked === undefined ? (
    <Button
      key={item.label}
      label={item.label}
      systemImage={sfSymbol(item.icon)}
      role={item.destructive ? "destructive" : undefined}
      modifiers={modifiers}
      onPress={item.onPress}
    />
  ) : (
    <Toggle
      key={item.label}
      label={item.label}
      systemImage={sfSymbol(item.icon)}
      isOn={item.checked}
      onIsOnChange={item.onPress}
      modifiers={modifiers}
    />
  );
}

/** The rows, groups as sections and submenus as nested menus. */
function menuRows(rows: MenuItem[]) {
  return rows.map((item) =>
    isGroup(item) ? (
      <Section key={`group-${item.heading}`} title={item.heading}>
        {item.items.map(actionRow)}
      </Section>
    ) : isSubmenu(item) ? (
      <SwiftUIMenu
        key={item.label}
        label={item.label}
        systemImage={sfSymbol(item.icon)}
        modifiers={item.disabled ? [disabledModifier(true)] : undefined}
      >
        {item.items.map(actionRow)}
      </SwiftUIMenu>
    ) : (
      actionRow(item)
    ),
  );
}

/**
 * The trigger renders as SwiftUI content, not through an `RNHostView`: an RN
 * surface nested back into the label stays unmeasured, so invisible (as in
 * `@expo/ui`'s `MenuView`). The menu owns the tap: a trigger's own press
 * handler won't fire.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/
 */
export function Menu({ items, children }: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);

  const menu = <SwiftUIMenu label={children}>{menuRows(rows)}</SwiftUIMenu>;

  return withDialog(menu, items, pending, close);
}

/** A confirming row makes the menu the dialog's trigger: on an `EmptyView` it never presents. */
function withDialog(
  menu: JSX.Element,
  items: MenuItem[],
  pending: ReturnType<typeof useMenuDialogState>["pending"],
  close: () => void,
) {
  const confirms = items
    .flatMap((item) => ("items" in item ? item.items : [item]))
    .some((item) => item.onPressMode === "dialog");
  if (!confirms) {
    return <EnsureHost matchContents>{menu}</EnsureHost>;
  }

  const config =
    pending?.onPressMode === "dialog" ? pending.dialogConfig : undefined;

  return (
    <Dialog
      title={config?.title ?? ""}
      description={config?.description}
      confirmLabel={config?.confirmLabel ?? ""}
      role={pending?.destructive ? "destructive" : undefined}
      onConfirm={() => pending?.onPress()}
      open={!!config}
      onOpenChange={(next) => {
        if (!next) close();
      }}
      alert
    >
      <Dialog.Trigger>{menu}</Dialog.Trigger>
    </Dialog>
  );
}

/**
 * SwiftUI's context menu: a long press opens it, a tap stays the content's.
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/contextmenu/
 */
export function ContextMenu({ items, children }: ContextMenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);
  const menu = (
    <SwiftUIContextMenu>
      <SwiftUIContextMenu.Items>{menuRows(rows)}</SwiftUIContextMenu.Items>
      <SwiftUIContextMenu.Trigger>{children}</SwiftUIContextMenu.Trigger>
    </SwiftUIContextMenu>
  );
  return withDialog(menu, items, pending, close);
}
