/**
 * `run` calls `call` once calls pause for `delay` ms (`0` calls it every
 * time); `flush` calls it now and drops the pending one; `cancel` drops it.
 */
export function debouncer<T>(call: (value: T) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const cancel = () => clearTimeout(timer);

  const flush = (value: T) => {
    cancel();
    call(value);
  };

  const run = (value: T) => {
    if (delay <= 0) return flush(value);
    cancel();
    timer = setTimeout(() => call(value), delay);
  };

  return { run, flush, cancel };
}
