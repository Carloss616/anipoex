import {
  background,
  border,
  clipShape,
  frame,
  type ModifierConfig,
} from "@expo/ui/swift-ui/modifiers";
import { StyleSheet } from "react-native";
import type { StyleModifiers } from "./resolve-fill";

/**
 * `w-full` reaches @expo/ui as the string `"100%"`, which it casts straight to a
 * native number — SwiftUI drops it and Compose crashes on it. `flex-1` arrives as
 * `{ flex: 1 }`, a prop neither native layout has ever heard of. Both are really a
 * frame that takes everything it is offered — and it goes ahead of the caller's own
 * modifiers, so a background or a glass effect paints the width it grew to instead
 * of the width it started at.
 *
 * SwiftUI splits the slack evenly between greedy frames, so a `flex-2` next to a
 * `flex-1` still comes out 50/50 here.
 */
export function resolveFill({
  style,
  modifiers,
}: StyleModifiers): StyleModifiers {
  const flat: Record<string, unknown> = {
    ...(StyleSheet.flatten(style) ?? {}),
  };
  const box: Parameters<typeof frame>[0] = {};
  const grows = typeof flat.flex === "number" && flat.flex > 0;

  if (grows) delete flat.flex;
  if (grows || flat.width === "100%") {
    delete flat.width;
    box.maxWidth = Infinity;
  }
  if (grows || flat.height === "100%") {
    delete flat.height;
    box.maxHeight = Infinity;
  }

  if (!Object.keys(box).length) return { style, modifiers };

  // @expo/ui drops its own `frame` when we pass one, so fixed sizes join ours
  // (as min = max: a plain width/height would cancel the max).
  if (typeof flat.width === "number") {
    box.minWidth = box.maxWidth = flat.width;
    delete flat.width;
  }
  if (typeof flat.height === "number") {
    box.minHeight = box.maxHeight = flat.height;
    delete flat.height;
  }

  // Derived modifiers land ahead of ours, so a style background would paint
  // the view before the frame grows it. Same order @expo/ui uses, after it.
  const paint: ModifierConfig[] = [];
  if (flat.backgroundColor) {
    paint.push(background(flat.backgroundColor as string));
    delete flat.backgroundColor;
  }
  if (flat.borderWidth != null && flat.borderColor != null) {
    paint.push(
      border({
        content: flat.borderColor as string,
        width: flat.borderWidth as number,
      }),
    );
    delete flat.borderWidth;
    delete flat.borderColor;
  }
  if (typeof flat.borderRadius === "number") {
    paint.push(clipShape("roundedRectangle", flat.borderRadius));
    delete flat.borderRadius;
  }

  return {
    style: flat,
    modifiers: [frame(box), ...paint, ...(modifiers ?? [])],
  };
}
