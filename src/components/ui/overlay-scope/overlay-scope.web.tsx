import { type KeyboardEvent, type RefObject, useEffect, useRef } from "react";
import { FocusScope, useFocusManager } from "react-aria/FocusScope";
import { useModalOverlay } from "react-aria/useModalOverlay";
import type { OverlayScopeProps } from "./overlay-scope";

const ARROWS = {
  vertical: { next: "ArrowDown", previous: "ArrowUp" },
  horizontal: { next: "ArrowRight", previous: "ArrowLeft" },
} as const;

// Open scopes, last on top: only the top one pulls stray focus back.
const open: RefObject<HTMLDivElement | null>[] = [];

// Disabled rows are focusable (tabindex -1) but not tabbable, so arrows skip them.
const MOVE = { wrap: true, tabbable: true };

/**
 * Web keyboard behavior for an open overlay: focus moves in and stays in,
 * returns to the opener on close, Escape closes the top-most one, and the
 * page behind is hidden from screen readers.
 */
export function OverlayScope(props: OverlayScopeProps) {
  return (
    <FocusScope contain restoreFocus autoFocus>
      <Scope {...props} />
    </FocusScope>
  );
}

function Scope({
  onClose,
  arrows,
  label,
  className,
  children,
}: OverlayScopeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const focus = useFocusManager();
  const { modalProps } = useModalOverlay(
    { isDismissable: false },
    {
      isOpen: true,
      setOpen: (open) => !open && onClose(),
      open: () => {},
      close: onClose,
      toggle: onClose,
      point: null,
      setPoint: () => {},
    },
    ref,
  );

  // autoFocus runs before Reanimated's entering animation unhides the content,
  // and PanelUI hands focus back to a closed menu's trigger after it: both
  // leave focus outside, so the top-most scope takes it in itself.
  useEffect(() => {
    open.push(ref);
    let frame = 0;
    let tries = 0;
    const reclaim = (event?: FocusEvent) => {
      const target = (event?.target as Node) ?? document.activeElement;
      if (open.at(-1) !== ref || ref.current?.contains(target)) return;
      // shortcut: retries ~0.5s of frames, enough for PanelUI's 150ms entering animations.
      if (!focus?.focusFirst({ tabbable: true }) && tries++ < 30)
        frame = requestAnimationFrame(() => reclaim());
    };
    reclaim();
    document.addEventListener("focusin", reclaim);
    return () => {
      cancelAnimationFrame(frame);
      open.splice(open.indexOf(ref), 1);
      document.removeEventListener("focusin", reclaim);
    };
  }, [focus]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    modalProps.onKeyDown?.(event);
    if (!arrows || event.defaultPrevented) return;
    const keys = ARROWS[arrows];
    if (event.key === keys.next) focus?.focusNext(MOVE);
    else if (event.key === keys.previous) focus?.focusPrevious(MOVE);
    else if (event.key === "Home") focus?.focusFirst({ tabbable: true });
    else if (event.key === "End") focus?.focusLast({ tabbable: true });
    else return;
    event.preventDefault();
  };

  const dialog = label
    ? ({ role: "dialog", "aria-modal": true, "aria-label": label } as const)
    : {};

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: key events bubble up from the rows it wraps
    <div
      ref={ref}
      {...modalProps}
      {...dialog}
      onKeyDown={onKeyDown}
      className={className}
    >
      {children}
    </div>
  );
}
