/** Keyboard focus in the theme's ring color; web only, native ignores these classes. */
export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Pointer hover on web, skipped while disabled (PanelUI dims a disabled control through opacity). */
export const HOVER = "web:cursor-pointer hover:not-aria-disabled:opacity-90";
