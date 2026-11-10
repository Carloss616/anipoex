import { scanStops } from "../../../state/scan-views";
import {
  type MarkState,
  orderMarks,
  type SourceMark,
  visibleMarks,
} from "./marks";
import { widgetImage } from "./widget-image";

/** A source's mark as a widget layout draws it. */
export interface WidgetMark {
  /** The icon's widget file; none draws the initials. */
  uri?: string;
  initials: string;
  state: MarkState;
  unread?: number;
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

const downloads = new Map<string, Promise<string | undefined>>();
const files = new Map<string, string>();

/**
 * Image urls as widget files, for one activity: a saved one returns at once,
 * the rest download and call `onLoad` as each lands.
 */
export function imageLoader(onLoad: () => void) {
  // shortcut: a failed download isn't retried until the app restarts; retry
  // it if icons go missing.
  const asked = new Set<string>();
  return (url: string | undefined) => {
    if (!url) return undefined;
    if (!asked.has(url) && !files.has(url)) {
      asked.add(url);
      let download = downloads.get(url);
      if (!download) {
        download = widgetImage(url).then((file) => {
          if (file) files.set(url, file);
          return file;
        });
        downloads.set(url, download);
      }
      void download.then((file) => file && onLoad());
    }
    return files.get(url);
  };
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
