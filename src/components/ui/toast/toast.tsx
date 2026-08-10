import {
  Toast,
  type ToastVariant,
  useToast as useHeroUIToast,
} from "heroui-native/toast";
import { useEffect } from "react";

export interface ToastOptions {
  color?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
}

export type ShowToast = (message: string, options?: ToastOptions) => void;

let impl: ShowToast = () => {};

const show: ShowToast = (message, options) => impl(message, options);

const colored =
  (color: ToastVariant) =>
  (message: string, options?: Omit<ToastOptions, "color">) =>
    show(message, { ...options, color });

/** Shows a transient message — `toast.danger` and friends pick the color. */
export const toast = Object.assign(show, {
  accent: colored("accent"),
  success: colored("success"),
  warning: colored("warning"),
  danger: colored("danger"),
});

/**
 * Mount once inside `HeroUINativeProvider`. Renders nothing — it only captures
 * HeroUI's hook, so `toast` stays callable outside React.
 *
 * @see https://heroui.com/en/docs/native/components/toast
 */
export function ToastHost() {
  const { toast: heroUIToast } = useHeroUIToast();

  useEffect(() => {
    impl = (message, options) => {
      heroUIToast.show({
        duration: options?.actionLabel ? "persistent" : undefined,
        component: (props) => (
          <Toast
            variant={options?.color}
            placement="bottom"
            className="w-full max-w-md flex-row items-center gap-2 self-center"
            {...props}
          >
            <Toast.Title className="flex-1">{message}</Toast.Title>
            {!!options?.onAction && (
              <Toast.Action
                onPress={() => {
                  options.onAction?.();
                  props.hide(props.id);
                }}
              >
                {options?.actionLabel}
              </Toast.Action>
            )}
            <Toast.Close />
          </Toast>
        ),
      });
    };
  }, [heroUIToast.show]);

  return null;
}
