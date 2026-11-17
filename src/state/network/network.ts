import { observable, observe } from "@legendapp/state";

export const network$ = observable({
  system: true,
  reachable: true,
  online: (): boolean => network$.system.get() && network$.reachable.get(),
});

// One set for every copy of this module: Fast Refresh keeps the old copy's
// observer running beside the new one.
const shared = globalThis as {
  __networkState?: { listeners: Set<() => void>; announced: boolean };
};
shared.__networkState ??= { listeners: new Set(), announced: false };
const state = shared.__networkState;

let wasOnline = true;
observe(() => {
  const online = network$.online.get();
  if (online && !wasOnline) for (const listener of state.listeners) listener();
  wasOnline = online;
});

export function setSystem(connected: boolean) {
  network$.system.set(connected);
  if (!connected) network$.reachable.set(false);
}

export function networkFailed() {
  network$.reachable.set(false);
}

export function networkAnswered() {
  network$.reachable.set(true);
}

export function onReconnect(listener: () => void) {
  state.listeners.add(listener);
  return () => {
    state.listeners.delete(listener);
  };
}

export function markOfflineAnnounced() {
  state.announced = true;
}

export function takeAnnounced() {
  const announced = state.announced;
  state.announced = false;
  return announced;
}
