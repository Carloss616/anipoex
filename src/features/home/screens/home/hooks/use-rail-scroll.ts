import type { Observable } from "@legendapp/state";
import { useObservable } from "@legendapp/state/react";
import { useRef } from "react";
import { useReducedMotion } from "react-native-reanimated";
import type { LegendListRef } from "@/components/layout/legend-list";

export type RailEdges = Observable<{ start: boolean; end: boolean }>;

/**
 * A horizontal list, a step of most of its width for the arrows, and whether
 * it sits at either end.
 */
export function useRailScroll() {
  const list = useRef<LegendListRef>(null);
  const edges$: RailEdges = useObservable({ start: true, end: true });
  const reduced = useReducedMotion();

  const ref = (instance: LegendListRef | null) => {
    list.current = instance;
    const node = instance?.getScrollableNode() as HTMLElement | undefined;
    if (!node) return;

    // 1px of slack: snapping and fractional widths stop just short of an end.
    const update = () =>
      edges$.set({
        start: node.scrollLeft <= 1,
        end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 1,
      });
    // The content's size moves the end too, as cards measure.
    const observer = new ResizeObserver(update);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    node.addEventListener("scroll", update, { passive: true });
    update();

    return () => {
      observer.disconnect();
      node.removeEventListener("scroll", update);
      list.current = null;
    };
  };

  const scroll = (direction: 1 | -1) => {
    const node = list.current?.getScrollableNode() as HTMLElement | undefined;
    node?.scrollBy({
      left: direction * node.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  return { ref, scroll, edges$ };
}
