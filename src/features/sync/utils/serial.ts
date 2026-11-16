/**
 * Wraps `run` so calls never overlap: a call while one runs waits for it and
 * then runs once more, however many calls came in meanwhile.
 */
export function serial(run: () => Promise<void>) {
  let running: Promise<void> | undefined;
  let again = false;
  return function request(): Promise<void> {
    if (running) {
      again = true;
      return running;
    }
    running = (async () => {
      do {
        again = false;
        await run();
      } while (again);
    })().finally(() => {
      running = undefined;
    });
    return running;
  };
}
