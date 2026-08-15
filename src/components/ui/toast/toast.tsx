import {
  toast as panelToast,
  type ToastPlacement,
  type ToastVariant,
} from "panelui-native/components/toast";
import { Platform } from "react-native";

/** iOS puts transient status at the top; everywhere else it belongs at the bottom. */
const PLACEMENT = Platform.select<ToastPlacement>({
  ios: "top",
  default: "bottom",
});

export interface ShowToastOptions {
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

export type ShowToast = (label: string, options?: ShowToastOptions) => void;

/**
 * PanelUI's viewport is mounted by `PanelUIProvider`, so there is nothing to
 * render here — [Android](./toast.android.tsx) is the platform that needs a
 * host of its own.
 */
export function ToastHost() {
  return null;
}

/** Shows a transient message — `toast.destructive` and friends pick the variant. */
const show: ShowToast = (label, options) => {
  const { onAction, ...rest } = options ?? {};

  panelToast.show({
    placement: PLACEMENT,
    label,
    ...(options?.actionLabel && { duration: 0 }),
    ...(onAction && {
      onActionPress: (handle) => {
        onAction();
        handle.hide();
      },
    }),
    ...rest,
  });
};

function variant(variant: ToastVariant): ShowToast {
  return (label, options) => show(label, { ...options, variant });
}

export const toast = Object.assign(show, {
  info: variant("info"),
  success: variant("success"),
  warning: variant("warning"),
  destructive: variant("destructive"),
});
