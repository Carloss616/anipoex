import { useEffect, useMemo, useRef } from "react";
import { debouncer } from "@/utils/debouncer";

/**
 * A `debouncer` for a component: it calls the latest `callback` and drops a
 * pending call on unmount.
 */
export function useDebouncedCallback<T>(
  callback: ((value: T) => void) | undefined,
  delay: number,
) {
  // Read through a ref so an inline callback doesn't need a stable identity.
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  });

  const debounced = useMemo(
    () => debouncer<T>((value) => latest.current?.(value), delay),
    [delay],
  );
  useEffect(() => debounced.cancel, [debounced]);

  return debounced;
}
