import { widgetImage } from "@/utils/widget-image";
import { scanStops } from "../../../state/scan-views";
import { type LibrarySummary, topNew } from "../../library-run";
import {
  type MarkState,
  orderMarks,
  type SourceMark,
  visibleMarks,
} from "./marks";

/** A source's mark as a widget layout draws it. */
export interface WidgetMark {
  /** The icon's widget file; none draws the initials. */
  uri?: string;
  initials: string;
  state: MarkState;
  unread?: number;
}

/** An ended Reading scan's cover, with its manga's new chapters. */
export interface WidgetCover {
  uri: string;
  unread: number;
}

/**
 * An ended Reading scan's covers, saved for a widget: most new chapters first,
 * up to 3, and how many manga with new chapters are left out.
 */
export async function endCovers(withNew: LibrarySummary["withNew"]) {
  const { top, more } = topNew(withNew);
  const uris = await Promise.all(top.map((m) => widgetImage(m.cover)));
  const covers = top.flatMap((m, i): WidgetCover[] => {
    const uri = uris[i];
    return uri ? [{ uri, unread: m.unread }] : [];
  });
  return { covers, coversMore: more };
}

/**
 * A widget Stop button's target for the scan at `key` (a manga id or
 * `library`): an interaction names no activity, only its target.
 */
export const stopTarget = (key: string) => `stop:${key}`;

/** Runs the Stop a widget button's target names. */
export function routeStop(target: string) {
  if (target.startsWith("stop:")) scanStops.get(target.slice(5))?.();
}

/** The marks a widget has room for, found first, and how many more. */
export function widgetMarks(
  marks: SourceMark[],
  image: (url: string | undefined) => string | undefined,
): { marks: WidgetMark[]; more: number } {
  const { shown, more } = visibleMarks(orderMarks(marks));
  return {
    marks: shown.map(({ iconUrl, initials, state, unread }) => ({
      uri: image(iconUrl),
      initials,
      state,
      unread,
    })),
    more,
  };
}
