import type { RefObject } from "react";

export interface TrackpadHandlers {
  /** A pinch starts at this point of the view. */
  onPinchStart: (x: number, y: number) => void;
  /** It grew by this factor since it started. */
  onPinch: (factor: number) => void;
  onPinchEnd: () => void;
  /** A two-finger scroll; true when handled, so the page doesn't scroll too. */
  onScroll: (dx: number, dy: number) => boolean;
}

/** Trackpad pinch and scroll, web only: touch is the gesture handler's. */
export function useTrackpad(
  _ref: RefObject<unknown>,
  _handlers: TrackpadHandlers,
) {}
