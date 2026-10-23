import { describe, expect, it } from "bun:test";
import { pinchAnchor, pinchTo } from "./zoom";

const view = { width: 400, maxScroll: 5000 };

describe("pinchTo", () => {
  it("keeps the point under the fingers in place", () => {
    const anchor = pinchAnchor(
      { scale: 1, translateX: 0, scroll: 1000 },
      100,
      200,
    );
    const zoom = pinchTo(anchor, {
      ...view,
      factor: 2,
      focalX: 100,
      focalY: 200,
    });
    expect(zoom).toEqual({ scale: 2, translateX: -100, scroll: 1100 });
    // The anchored content point (100 across, 1200 down) draws at the focal point.
    expect(zoom.scale * anchor.x + zoom.translateX).toBe(100);
    expect(zoom.scale * (anchor.y - zoom.scroll)).toBe(200);
  });

  it("follows fingers that move while pinching", () => {
    const anchor = pinchAnchor(
      { scale: 2, translateX: -100, scroll: 1100 },
      100,
      200,
    );
    const zoom = pinchTo(anchor, {
      ...view,
      factor: 1,
      focalX: 150,
      focalY: 260,
    });
    expect(zoom.translateX).toBe(-50);
    expect(zoom.scroll).toBe(1070);
  });

  it("keeps the scaled viewport over the screen", () => {
    const anchor = pinchAnchor({ scale: 1, translateX: 0, scroll: 0 }, 10, 10);
    const zoom = pinchTo(anchor, {
      ...view,
      factor: 3,
      focalX: 390,
      focalY: 100,
    });
    // Dragged right past the left edge, and up past the list's top.
    expect(zoom.translateX).toBe(0);
    expect(zoom.scroll).toBe(0);
  });

  it("stays between 1x and 3x", () => {
    const anchor = pinchAnchor(
      { scale: 2, translateX: -400, scroll: 100 },
      200,
      200,
    );
    expect(
      pinchTo(anchor, { ...view, factor: 0.1, focalX: 200, focalY: 200 }),
    ).toEqual({
      scale: 1,
      translateX: 0,
      scroll: 0,
    });
    expect(
      pinchTo(anchor, { ...view, factor: 10, focalX: 200, focalY: 200 }).scale,
    ).toBe(3);
  });
});
