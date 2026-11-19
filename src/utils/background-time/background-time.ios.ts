import { NativeModule, requireNativeModule } from "expo";
import { AppState } from "react-native";
import type { BackgroundWork, BackgroundWorkArgs } from "./background-time";

declare class BackgroundTimeModule extends NativeModule<{
  onExpire: (event: { name: string }) => void;
}> {
  begin(name: string): number;
  end(task: number): void;
  remaining(): Promise<number>;
  /** iOS 26's continued processing task; false where iOS refuses one. */
  beginContinued(name: string, title: string): Promise<boolean>;
  progressContinued(name: string, fraction: number): Promise<void>;
  endContinued(name: string): Promise<void>;
}

const backgroundTime =
  requireNativeModule<BackgroundTimeModule>("BackgroundTime");

/** Room for an update to land before iOS suspends the app. */
const EXPIRE_AHEAD_MS = 5_000;

const inBackground = () => AppState.currentState === "background";

/**
 * A continued processing task while the work runs (iOS 26), else a background
 * task of about 30s; `expire` runs before iOS takes the time back, and `back`
 * once the app returns.
 */
export function backgroundWork(
  name: string,
  { running, expire, back }: BackgroundWorkArgs,
): BackgroundWork {
  let task: number | undefined;
  /** A continued task was asked for, until release. */
  let asked = false;
  /** iOS granted it: no 30s clock to watch. */
  let continued = false;
  let expired = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const askContinued = () => {
    asked = true;
    void backgroundTime.beginContinued(name, name).then((ok) => {
      // Released meanwhile: the end already went out.
      if (asked) continued = ok;
    });
  };

  const expireNow = () => {
    expired = true;
    expire();
  };

  const schedule = () => {
    if (continued || !running() || !inBackground()) return;
    void backgroundTime.remaining().then((seconds) => {
      if (!inBackground()) return;
      // Right after the app leaves the screen iOS still reports no limit.
      timer =
        seconds > 600
          ? setTimeout(schedule, 1000)
          : setTimeout(
              () => {
                if (continued || !inBackground() || !running()) return;
                expireNow();
              },
              Math.max(0, seconds * 1000 - EXPIRE_AHEAD_MS),
            );
    });
  };

  // The system took the continued task back, or the user cancelled it.
  backgroundTime.addListener("onExpire", (event) => {
    if (event.name !== name || !continued) return;
    continued = false;
    asked = false;
    if (running()) expireNow();
  });

  AppState.addEventListener("change", (state) => {
    clearTimeout(timer);
    if (state === "background") schedule();
    else if (state === "active" && expired) {
      expired = false;
      // iOS ended the task as the time ran out: the next trip off screen needs one.
      if (task !== undefined) {
        task = backgroundTime.begin(name);
        if (!asked) askContinued();
      }
      back();
    }
  });

  return {
    hold: () => {
      task ??= backgroundTime.begin(name);
      if (!asked) askContinued();
    },
    release: () => {
      if (task === undefined) return;
      backgroundTime.end(task);
      task = undefined;
      asked = false;
      continued = false;
      void backgroundTime.endContinued(name);
    },
    progress: (fraction) => {
      if (asked) void backgroundTime.progressContinued(name, fraction);
    },
  };
}

export async function finishOffScreen(
  name: string,
  work: () => Promise<unknown>,
) {
  const task = backgroundTime.begin(name);
  try {
    await work();
  } finally {
    backgroundTime.end(task);
  }
}
