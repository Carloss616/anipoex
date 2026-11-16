export interface BackgroundWorkArgs {
  /** Whether any work still runs; nothing expires once it's done. */
  running: () => boolean;
  /** Runs shortly before iOS suspends the app off screen. */
  expire: () => void;
  /** Runs when the app is back after `expire`. */
  back: () => void;
}

export interface BackgroundWork {
  /** Asks for background time; once until `release`. */
  hold(): void;
  release(): void;
}

/**
 * Work that keeps running off screen for as long as the OS lets it.
 * @platform ios
 */
export function backgroundWork(
  _name: string,
  _args: BackgroundWorkArgs,
): BackgroundWork {
  return { hold: () => {}, release: () => {} };
}
