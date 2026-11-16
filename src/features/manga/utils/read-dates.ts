import type { MangaReadDatesQuery } from "../graphql/manga-read-dates.generated";

type Activities = NonNullable<MangaReadDatesQuery["latest"]>["activities"];

export interface ReadDates {
  startedAt?: Date;
  completedAt?: Date;
}

const listActivities = (activities: Activities | undefined) =>
  (activities ?? []).flatMap((a) =>
    a?.__typename === "ListActivity" ? a : [],
  );

/** The local calendar day of an activity, as the date pickers hold it. */
const day = (createdAt: number) => {
  const at = new Date(createdAt * 1000);
  return new Date(at.getFullYear(), at.getMonth(), at.getDate());
};

const COMPLETED = "completed";

/**
 * When the reading that is about to be marked Completed began and ended, from
 * the viewer's list activity: the newest chapter read is the finish, the
 * first one the start, but only when it was chapter 1. Reads from before an
 * earlier Completed belong to that one, so a reread (`rereading`: the entry
 * is Rereading or was read before) gives no start.
 */
export function readDates(
  data: MangaReadDatesQuery | undefined,
  rereading = false,
): ReadDates {
  const latest = listActivities(data?.latest?.activities);
  const earliest = listActivities(data?.earliest?.activities);
  if (!latest.length) return {};

  const lastRead = latest.find((a) => a.progress || a.status === COMPLETED);
  const completedAt =
    lastRead?.progress != null ? day(lastRead.createdAt) : undefined;

  // An earlier Completed can sit past the newest page; the entry still knows.
  if (rereading || latest.some((a) => a.status === COMPLETED))
    return { completedAt };

  const firstRead = earliest.find((a) => a.progress || a.status === COMPLETED);
  const fromOne = firstRead?.progress && /^1(\s|$)/.test(firstRead.progress);
  const startedAt = fromOne ? day(firstRead.createdAt) : undefined;

  return { startedAt, completedAt };
}
