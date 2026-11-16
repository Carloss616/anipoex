import { widgetImage } from "./widget-image";

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

/** A widget's updates, as `coalesce` sends them. */
export interface WidgetUpdates<P> {
  push(props: P): void;
  /** Sends `props` as the last update; settles once it's sent. */
  end(props: P): Promise<void>;
}

export interface Clock {
  now(): number;
  after(ms: number, run: () => void): void;
}

const realClock: Clock = {
  now: () => Date.now(),
  after: (ms, run) => void setTimeout(run, ms),
};

/**
 * Runs sends one at a time, in order, each at least `interval` after the last
 * one settled: a native update posts at its end, after it renders.
 */
export interface Limiter {
  run(send: () => Promise<unknown>): void;
}

export function limiter(interval: number, clock = realClock): Limiter {
  const queue: (() => Promise<unknown>)[] = [];
  let busy = false;
  let waiting = false;
  let last = Number.NEGATIVE_INFINITY;
  const next = () => {
    if (busy || waiting || queue.length === 0) return;
    const wait = last + interval - clock.now();
    if (wait > 0) {
      waiting = true;
      clock.after(wait, () => {
        waiting = false;
        next();
      });
      return;
    }
    const send = queue.shift() as () => Promise<unknown>;
    busy = true;
    void Promise.resolve()
      .then(send)
      .catch(() => {})
      .finally(() => {
        busy = false;
        last = clock.now();
        next();
      });
  };
  return {
    run: (send) => {
      queue.push(send);
      next();
    },
  };
}

/**
 * Sends a widget's props through `limit`, the latest winning while it waits,
 * for fewer renders and calls to native. The end is always sent, last.
 */
export function coalesce<P>(
  send: (props: P, end: boolean) => Promise<unknown> | undefined,
  limit = limiter(250),
): WidgetUpdates<P> {
  let next: { props: P } | undefined;
  let ending: Promise<void> | undefined;
  let finish = () => {};
  let queued = false;
  const take = () => {
    queued = false;
    if (!next) return Promise.resolve();
    const { props } = next;
    const end = !!ending;
    next = undefined;
    return Promise.resolve()
      .then(() => send(props, end))
      .finally(() => {
        if (end) finish();
      });
  };
  const schedule = (props: P) => {
    next = { props };
    if (queued) return;
    queued = true;
    limit.run(take);
  };
  return {
    push: (props) => {
      if (!ending) schedule(props);
    },
    end: (props) => {
      if (!ending) {
        ending = new Promise((resolve) => {
          finish = resolve;
        });
        schedule(props);
      }
      return ending;
    },
  };
}

// Android sheds an app's notification posts past 5 a second, counted across
// all of them: every notification's posts and updates share one spacing.
export const notificationLimiter = limiter(350);
