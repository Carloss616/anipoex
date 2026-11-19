export interface BackgroundWorkArgs {
  /** Whether any work still runs; nothing expires once it's done. */
  running: () => boolean;
  /** Runs when the OS is about to take the background time back. */
  expire: () => void;
  /** Runs when the app is back after `expire`. */
  back: () => void;
}

export interface BackgroundWork {
  /** Asks for background time; once until `release`. */
  hold(): void;
  release(): void;
  /** How far the work is, 0 to 1: iOS ends a continued task that stalls. */
  progress(fraction: number): void;
}

/**
 * Work that keeps running off screen for as long as the OS lets it.
 * @platform ios
 * @platform android
 */
export function backgroundWork(
  _name: string,
  _args: BackgroundWorkArgs,
): BackgroundWork {
  return { hold: () => {}, release: () => {}, progress: () => {} };
}

/**
 * Runs short work as the app leaves the screen, asking iOS for the time it
 * takes; elsewhere it runs as is.
 */
export async function finishOffScreen(
  _name: string,
  work: () => Promise<unknown>,
) {
  await work();
}
