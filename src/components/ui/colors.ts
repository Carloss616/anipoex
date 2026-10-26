import type { ThemeColor } from "@/hooks/use-theme-color";

/**
 * The app's semantic colors: a fill, and the text that stays readable on it.
 *
 * In both forms: the native components need a color value, and Tailwind only
 * emits a class it can read literally, so `bg-${token}` would never exist.
 */
export const SEMANTIC_COLOR = {
  primary: {
    token: { fill: "primary", label: "primary-foreground" },
    className: { fill: "bg-primary", label: "text-primary-foreground" },
  },
  secondary: {
    token: { fill: "secondary", label: "secondary-foreground" },
    className: { fill: "bg-secondary", label: "text-secondary-foreground" },
  },
  // `-solid-foreground`; plain `-foreground` is for bg-*-subtle and bg-success-soft.
  success: {
    token: { fill: "success", label: "success-solid-foreground" },
    className: { fill: "bg-success", label: "text-success-solid-foreground" },
  },
  info: {
    token: { fill: "info", label: "info-solid-foreground" },
    className: { fill: "bg-info", label: "text-info-solid-foreground" },
  },
  warning: {
    token: { fill: "warning", label: "warning-solid-foreground" },
    className: { fill: "bg-warning", label: "text-warning-solid-foreground" },
  },
  destructive: {
    token: { fill: "destructive", label: "destructive-solid-foreground" },
    className: {
      fill: "bg-destructive",
      label: "text-destructive-solid-foreground",
    },
  },
} as const satisfies Record<
  string,
  {
    token: { fill: ThemeColor; label: ThemeColor };
    className: { fill: string; label: string };
  }
>;

/** The semantic color names the app's own components accept. */
export type SemanticColor = keyof typeof SEMANTIC_COLOR;
