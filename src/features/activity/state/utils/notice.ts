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
 * Returns the handler for each connection value and the count of pending
 * changes at that moment (a reconnect flush empties the queue before the
 * delay ends). The first value is the starting state, and a value shows its
 * notice after `delay` only if it still differs from the last settled one. A
 * repeated value keeps the scheduled notice and its count.
 */
export function debounceNotice(
  takeAnnounced: () => boolean,
  show: (text: string) => void,
  delay = NOTICE_DELAY_MS,
) {
  let settled: boolean | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let last: boolean | undefined;
  return (online: boolean, pending: number) => {
    if (online === last) return;
    last = online;
    clearTimeout(timer);
    if (settled === undefined) {
      settled = online;
      return;
    }
    timer = setTimeout(() => {
      const announced = takeAnnounced();
      if (online === settled) return;
      settled = online;
      const text = noticeText(online, announced, pending);
      if (text) show(text);
    }, delay);
  };
}
