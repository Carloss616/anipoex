export const NOTICE_DELAY_MS = 3000;

/** The notice for a connection change, or undefined when it stays quiet. */
export function noticeText(
  online: boolean,
  announced: boolean,
  pending: number,
): string | undefined {
  if (!online)
    return announced
      ? undefined
      : "You're offline · Changes stay on this device";
  if (!pending) return "Back online";
  return `Back online · Sending ${pending} ${pending === 1 ? "change" : "changes"}`;
}

/**
 * Returns the handler for each connection value: the first is ignored, and a
 * value shows its notice after `delay` unless another value comes first.
 */
export function debounceNotice(
  decide: (online: boolean) => string | undefined,
  show: (text: string) => void,
  delay = NOTICE_DELAY_MS,
) {
  let first = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (online: boolean) => {
    clearTimeout(timer);
    if (first) {
      first = false;
      return;
    }
    timer = setTimeout(() => {
      const text = decide(online);
      if (text) show(text);
    }, delay);
  };
}
