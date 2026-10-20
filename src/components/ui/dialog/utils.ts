import type { DialogAction, DialogProps } from "./dialog";

function listActions(props: DialogProps): DialogAction[] {
  if (props.actions) return props.actions;
  return [
    { label: props.confirmLabel, onPress: props.onConfirm, role: props.role },
  ];
}

/** The dialog's buttons: a `role: "cancel"` action replaces the built-in Cancel, so there's only ever one. */
export function dialogActions(props: DialogProps) {
  const all = listActions(props);
  const cancel: DialogAction = all.find((a) => a.role === "cancel") ?? {
    label: props.cancelLabel ?? "Cancel",
    onPress: () => {},
    role: "cancel",
  };
  return { actions: all.filter((a) => a !== cancel), cancel };
}
