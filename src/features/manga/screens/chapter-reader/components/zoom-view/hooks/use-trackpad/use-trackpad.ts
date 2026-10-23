import type { RefObject } from "react";

export interface TrackpadHandlers {
  /** A pinch starts at this point of the view. */
  onPinchStart: (x: number, y: number) => void;
  /** It grew by this factor since it started. */
  onPinch: (factor: number) => void;
  onPinchEnd: () => void;
  /** A two-finger scroll by these deltas; true when it handled it, so the page doesn't scroll too. */
  onScroll: (dx: number, dy: number) => boolean;
}

/** Trackpad pinches and scrolls on the view. Only web has them; touch comes from the gesture handler. */
export function useTrackpad(
  _ref: RefObject<unknown>,
  _handlers: TrackpadHandlers,
) {}
