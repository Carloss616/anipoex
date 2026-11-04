import { useValue } from "@legendapp/state/react";
import { cn } from "panelui-native/utils/cn";
import { Button } from "panelui-web/button";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Toaster as Sonner, toast as sonner, type ToasterProps } from "sonner";
import { theme$ } from "@/state/theme";
import { Icon, Icons } from "../icon";

export type ToastVariant = "default" | "info" | "success" | "warning" | "error";

export interface ShowToastOptions {
  variant?: ToastVariant;
  action?: {
    label: string;
    onAction: () => void;
  };
}

export type ShowToast = (label: string, options?: ShowToastOptions) => void;
export type ShowToastVariant = (
  label: string,
  options?: Omit<ShowToastOptions, "variant">,
) => void;

const richColorsOf = (key: string, _token?: string) => {
  const token = _token ?? key;
  return {
    [`--${key}-bg`]: `color-mix(in oklab,var(--color-${token}) 10%,var(--color-popover))`,
    [`--${key}-bg-hover`]: `color-mix(in oklab,var(--color-${token}) 20%,var(--color-popover))`,
    [`--${key}-border`]: `color-mix(in oklab,var(--color-${token}) 14%,transparent)`,
    [`--${key}-border-hover`]: `color-mix(in oklab,var(--color-${token}) 24%,transparent)`,
    [`--${key}-text`]: `var(--color-${token}-foreground)`,
  };
};

/**
 * Wraps the app: the iOS toast's portal, so a sheet can host it.
 * @platform ios
 */
export const ToastProvider = ({ children }: { children: ReactNode }) =>
  children;

/**
 * Hosts the toasts inside a native sheet, which covers the root's host.
 * @platform ios
 */
export const SheetToastHost = () => null;

/**
 * Web: sonner, portaled to `<body>`: inside the app root it stacks under the
 * sheets' and dialogs' portals, which cover it and take its clicks.
 */
export function ToastHost({
  className,
  icons,
  style,
  toastOptions,
  ...props
}: ToasterProps) {
  const theme = useValue(theme$.preference);
  if (typeof document === "undefined") return null;

  const offset: ToasterProps["offset"] = {
    bottom: "var(--spacing-gb)",
    left: "var(--spacing-gx)",
    right: "var(--spacing-gx)",
  };

  return createPortal(
    <Sonner
      theme={theme}
      icons={{
        success: (
          <Icon name={Icons.checkCircle} size={16} className="text-success" />
        ),
        info: <Icon name={Icons.info} size={16} className="text-info" />,
        warning: <Icon name={Icons.error} size={16} className="text-warning" />,
        error: (
          <Icon name={Icons.error} size={16} className="text-destructive" />
        ),
        close: <Icon name={Icons.close} size={12} color="inherit" />,
        ...icons,
      }}
      className={cn("gutters", className)}
      offset={offset}
      mobileOffset={offset}
      position="bottom-center"
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--color-popover)",
          "--normal-bg-hover": "var(--color-accent)",
          "--normal-text": "var(--color-popover-foreground)",
          "--normal-border": "var(--color-border)",
          "--normal-border-hover": "var(--color-accent)",
          "--border-radius": "var(--radius-2xl)",
          ...richColorsOf("success"),
          ...richColorsOf("info"),
          ...richColorsOf("warning"),
          ...richColorsOf("error", "destructive"),
          fontFamily: "inherit",
          ...style,
        } as React.CSSProperties
      }
      toastOptions={{
        ...toastOptions,
        className: cn("group", toastOptions?.className),
        classNames: {
          ...toastOptions?.classNames,
          toast: cn(
            // `!` beats sonner's shadow, its focus ring too, so the ring is redrawn.
            "glass-chrome! shadow-lg focus-visible:ring-2 focus-visible:ring-black/20",
            "data-rich-colors:data-[type=success]:[--glass-tint:var(--success-bg)]!",
            "data-rich-colors:data-[type=info]:[--glass-tint:var(--info-bg)]!",
            "data-rich-colors:data-[type=warning]:[--glass-tint:var(--warning-bg)]!",
            "data-rich-colors:data-[type=error]:[--glass-tint:var(--error-bg)]!",
            toastOptions?.classNames?.toast,
          ),
          closeButton: cn(
            "shadow-sm",
            "active:not-disabled:scale-[0.97] motion-reduce:active:scale-100",
            // success
            "group-data-rich-colors:group-data-[type=success]:[--normal-bg-hover:var(--success-bg-hover)]",
            "group-data-rich-colors:group-data-[type=success]:[--normal-border-hover:var(--success-border-hover)]",
            // info
            "group-data-rich-colors:group-data-[type=info]:[--normal-bg-hover:var(--info-bg-hover)]",
            "group-data-rich-colors:group-data-[type=info]:[--normal-border-hover:var(--info-border-hover)]",
            // warning
            "group-data-rich-colors:group-data-[type=warning]:[--normal-bg-hover:var(--warning-bg-hover)]",
            "group-data-rich-colors:group-data-[type=warning]:[--normal-border-hover:var(--warning-border-hover)]",
            // error
            "group-data-rich-colors:group-data-[type=error]:[--normal-bg-hover:var(--error-bg-hover)]",
            "group-data-rich-colors:group-data-[type=error]:[--normal-border-hover:var(--error-border-hover)]",
            toastOptions?.classNames?.closeButton,
          ),
        },
      }}
      {...props}
    />,
    document.body,
  );
}

/** Shows a transient message — `toast.error` and friends pick the variant. */
const show: ShowToast = (label, { variant = "default", action } = {}) => {
  const fn = variant === "default" ? sonner : sonner[variant];
  const id = fn(
    label,
    action
      ? {
          duration: Infinity,
          action: (
            <Button
              variant="secondary"
              onClick={() => {
                action.onAction();
                sonner.dismiss(id);
              }}
            >
              {action.label}
            </Button>
          ),
        }
      : undefined,
  );
};

function variant(variant: ToastVariant): ShowToastVariant {
  return (label, options) => show(label, { ...options, variant });
}

export const toast = Object.assign(show, {
  info: variant("info"),
  success: variant("success"),
  warning: variant("warning"),
  error: variant("error"),
});

export type Toast = typeof toast;
