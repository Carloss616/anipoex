import { expect, test } from "bun:test";
import { gql, InMemoryCache } from "@apollo/client";
import { MediaListStatus } from "@/graphql/types.generated";
import type { MangaDetailFragment } from "./manga-fragments.generated";
import {
  MangaDetailFragmentDoc,
  MangaTrackingFragmentDoc,
} from "./manga-fragments.generated";

const MEDIA_ID = "Media:1";
const ENTRY_ID = "MediaList:7";

function seed() {
  const cache = new InMemoryCache();

  cache.writeFragment({
    id: ENTRY_ID,
    fragment: MangaTrackingFragmentDoc,
    fragmentName: "MangaTracking",
    data: {
      __typename: "MediaList",
      status: MediaListStatus.Current,
      progress: 1,
      score: 0,
      startedAt: null,
      completedAt: null,
      notes: null,
    },
  });

  cache.writeFragment({
    id: MEDIA_ID,
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    data: {
      __typename: "Media",
      title: {
        __typename: "MediaTitle",
        userPreferred: "Berserk",
        english: null,
        romaji: null,
        native: null,
      },
      chapters: 380,
      mediaListEntry: { __typename: "MediaList", id: 7 },
      // Partial on purpose: the assertions are about who gets notified, and the
      // real cache is partial too until the detail query lands.
    } as MangaDetailFragment,
  });

  return cache;
}

/** Counts every emission of a fragment watch, starting with the initial read. */
function countEmissions(observable: {
  subscribe: (cb: () => void) => unknown;
}) {
  const counter = { n: 0 };
  observable.subscribe(() => counter.n++);
  return counter;
}

test("a progress write notifies the entry watchers but not the screen's", () => {
  const cache = seed();

  const screen = countEmissions(
    cache.watchFragment({
      fragment: MangaDetailFragmentDoc,
      fragmentName: "MangaDetail",
      from: MEDIA_ID,
    }),
  );
  const entry = countEmissions(
    cache.watchFragment({
      fragment: MangaTrackingFragmentDoc,
      fragmentName: "MangaTracking",
      from: ENTRY_ID,
    }),
  );

  expect(screen.n).toBe(1);
  expect(entry.n).toBe(1);

  cache.writeFragment({
    id: ENTRY_ID,
    fragment: MangaTrackingFragmentDoc,
    fragmentName: "MangaTracking",
    data: {
      __typename: "MediaList",
      status: MediaListStatus.Current,
      progress: 2,
      score: 0,
      startedAt: null,
      completedAt: null,
      notes: null,
    },
  });

  expect(entry.n).toBe(2);
  expect(screen.n).toBe(1);
});

test("linking a new entry does notify the screen, so the id flows down", () => {
  const cache = seed();
  cache.modify({
    id: MEDIA_ID,
    fields: { mediaListEntry: () => null },
  });

  const screen = countEmissions(
    cache.watchFragment({
      fragment: MangaDetailFragmentDoc,
      fragmentName: "MangaDetail",
      from: MEDIA_ID,
    }),
  );

  cache.modify({
    id: MEDIA_ID,
    fields: { mediaListEntry: () => ({ __ref: ENTRY_ID }) },
  });

  expect(screen.n).toBe(2);
});

test("the screen still reads the entry's fields, it just isn't woken by them", () => {
  const cache = seed();

  const screen = cache.readFragment({
    id: MEDIA_ID,
    fragment: MangaDetailFragmentDoc,
    fragmentName: "MangaDetail",
    returnPartialData: true,
  }) as { mediaListEntry?: { progress?: number } } | null;

  // `@nonreactive` suppresses the notification, not the read: one round trip
  // still fills the cache that `useTrackingEntry` subscribes to.
  expect(screen?.mediaListEntry?.progress).toBe(1);
});

/**
 * The control for the test above. `@nonreactive` inside a fragment watch is
 * undocumented, so this pins the behaviour the split depends on: drop the
 * directive and the very same write does wake the screen.
 */
test("without @nonreactive the same write would wake the screen", () => {
  const reactive = gql`
    fragment ReactiveEntry on MediaList {
      progress
    }
    fragment ReactiveDetail on Media {
      chapters
      mediaListEntry {
        id
        ...ReactiveEntry
      }
    }
  `;

  const cache = new InMemoryCache();
  cache.writeFragment({
    id: MEDIA_ID,
    fragment: reactive,
    fragmentName: "ReactiveDetail",
    data: {
      __typename: "Media",
      chapters: 380,
      mediaListEntry: { __typename: "MediaList", id: 7, progress: 1 },
    },
  });

  const screen = countEmissions(
    cache.watchFragment({
      fragment: reactive,
      fragmentName: "ReactiveDetail",
      from: MEDIA_ID,
    }),
  );

  cache.writeFragment({
    id: ENTRY_ID,
    fragment: reactive,
    fragmentName: "ReactiveEntry",
    data: { __typename: "MediaList", progress: 2 },
  });

  expect(screen.n).toBe(2);
});
