import { Button, Menu as SwiftUIMenu, Toggle } from "@expo/ui/swift-ui";
import { disabled as disabledModifier } from "@expo/ui/swift-ui/modifiers";
import { Dialog } from "../dialog";
import { EnsureHost } from "../host";
import { sfSymbol } from "../icon";
import { useMenuDialogState } from "./hooks/use-menu-dialog";
import type { MenuAction, MenuProps } from "./menu";
import { isSubmenu } from "./utils";

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

/**
 * iOS Menu: a SwiftUI `Menu` whose label is the trigger.
 *
 * The trigger renders inside the host as SwiftUI content, not through an
 * `RNHostView` — nesting an RN surface back into the label is what leaves the
 * trigger unmeasured (and so invisible) in `@expo/ui`'s drop-in `MenuView`.
 * Pass presentation content: the menu owns the tap, so a trigger with its own
 * press handler will not fire.
 *
 * A confirming row hands the whole menu to the dialog as its trigger rather
 * than putting a dialog beside it. `.confirmationDialog` presents from the
 * view it is attached to, and with nothing in the trigger slot that view is an
 * `EmptyView` it never presents from — the menu label is the anchor that
 * outlives the row. The press that opens the dialog is the row's, not the
 * trigger's, so `open` still drives it.
 *
 * @see https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/menu/
 */
export function Menu({ items, children, onPrimaryAction }: MenuProps) {
  const { rows, pending, close } = useMenuDialogState(items);

  const menu = (
    <SwiftUIMenu label={children} onPrimaryAction={onPrimaryAction}>
      {rows.map((item) =>
        isSubmenu(item) ? (
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
      )}
    </SwiftUIMenu>
  );

  const confirms = items
    .flatMap((item) => (isSubmenu(item) ? item.items : [item]))
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
