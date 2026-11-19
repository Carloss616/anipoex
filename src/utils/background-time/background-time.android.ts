import { NativeModule, requireNativeModule } from "expo";
import { AppRegistry, AppState } from "react-native";
import type { BackgroundWork, BackgroundWorkArgs } from "./background-time";

declare class BackgroundTimeModule extends NativeModule<{
  onExpire: () => void;
}> {
  begin(name: string): Promise<boolean>;
  end(name: string): Promise<void>;
}

const backgroundTime =
  requireNativeModule<BackgroundTimeModule>("BackgroundTime");
const LINGER_MS = 2_000;

// Native ends it with finishTask when the last hold goes; it only has to run.
AppRegistry.registerHeadlessTask(
  "BackgroundWork",
  () => () => new Promise<void>(() => {}),
);

/**
 * A foreground service while the work runs, else Android freezes the app off
 * screen; `expire` runs when Android 15 takes its daily budget back, and
 * `back` once the app returns.
 */
export function backgroundWork(
  name: string,
  { running, expire, back }: BackgroundWorkArgs,
): BackgroundWork {
  let held = false;
  let expired = false;
  let ending: ReturnType<typeof setTimeout> | undefined;

  backgroundTime.addListener("onExpire", () => {
    if (!held) return;
    held = false;
    if (!running()) return;
    expired = true;
    expire();
  });

  AppState.addEventListener("change", (state) => {
    if (state !== "active" || !expired) return;
    expired = false;
    back();
  });

  return {
    hold: () => {
      clearTimeout(ending);
      if (held) return;
      held = true;
      // Refused from the background: the work runs on as it can, and the
      // next hold asks again.
      void backgroundTime.begin(name).then((ok) => {
        if (!ok) held = false;
      });
    },
    release: () => {
      if (!held) return;
      held = false;
      // Off screen, timers run only while the hold pumps frames: the notification
      // limiter still has the work's last update to send.
      ending = setTimeout(() => void backgroundTime.end(name), LINGER_MS);
    },
    progress: () => {},
  };
}

// shortcut: no service for short work, which leans on the seconds before the
// cached-app freezer; hold backgroundWork if a slow sync gets cut off.
export async function finishOffScreen(
  _name: string,
  work: () => Promise<unknown>,
) {
  await work();
}
