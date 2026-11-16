import { requireNativeModule } from "expo";
import { AppState } from "react-native";
import type { BackgroundWork, BackgroundWorkArgs } from "./background-time";

// shortcut: iOS grants about 30s once the app leaves the screen; longer work
// needs BGContinuedProcessingTask (iOS 26).
const backgroundTime = requireNativeModule<{
  begin(name: string): number;
  end(task: number): void;
  remaining(): Promise<number>;
}>("BackgroundTime");

/** Room for an update to land before iOS suspends the app. */
const EXPIRE_AHEAD_MS = 5_000;

const inBackground = () => AppState.currentState === "background";

/**
 * One background task while the work runs, else iOS suspends it off screen;
 * `expire` runs before the time runs out, and `back` once the app returns.
 */
export function backgroundWork(
  name: string,
  { running, expire, back }: BackgroundWorkArgs,
): BackgroundWork {
  let task: number | undefined;
  let expired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const schedule = () => {
    if (!running() || !inBackground()) return;
    void backgroundTime.remaining().then((seconds) => {
      if (!inBackground()) return;
      // Right after the app leaves the screen iOS still reports no limit.
      timer =
        seconds > 600
          ? setTimeout(schedule, 1000)
          : setTimeout(
              () => {
                if (!inBackground() || !running()) return;
                expired = true;
                expire();
              },
              Math.max(0, seconds * 1000 - EXPIRE_AHEAD_MS),
            );
    });
  };

  AppState.addEventListener("change", (state) => {
    clearTimeout(timer);
    if (state === "background") schedule();
    else if (state === "active" && expired) {
      expired = false;
      // iOS ended the task as the time ran out: the next trip off screen needs one.
      if (task !== undefined) task = backgroundTime.begin(name);
      back();
    }
  });

  return {
    hold: () => {
      task ??= backgroundTime.begin(name);
    },
    release: () => {
      if (task === undefined) return;
      backgroundTime.end(task);
      task = undefined;
    },
  };
}
