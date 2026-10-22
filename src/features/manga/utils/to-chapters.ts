import type { SourceChapter } from "@/features/extensions";
import { formatDate } from "@/utils/utils";

/** A number with optional decimals and a trailing word or letter, e.g. 12, 12.5, 12a, 12.extra. */
const NUMBER_PATTERN = String.raw`([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?`;
// "Mokushiroku Alice Vol.1 Ch. 4: Misrepresentation" -> 4
const BASIC = new RegExp(String.raw`(?<=ch\.) *${NUMBER_PATTERN}`);
// "Bleach 567: Down With Snowwhite" -> 567
const NUMBER = new RegExp(NUMBER_PATTERN, "g");
// "Onepunch-Man Punch Ver002 028" -> "Onepunch-Man Punch 028"
const UNWANTED = /\b(?:ver|version)[^a-z]?[0-9]+/g;
// "One Piece 12 special" -> "One Piece 12special"
const UNWANTED_WHITE_SPACE = /\s(?=extra|special|omake)/g;
// A volume or season, the short forms only right before the number since "s" also ends words.
const VOLUME =
  /\b(?:(?:vol(?:ume)?|season)[^a-z0-9]? *|[vs]\.?)([0-9]+(?:\.[0-9]+)?)\b/g;
// "Chapter 1.5 Part II" -> b
const PART = /\bpart\.? *([0-9]+|i{1,3}|iv|vi{0,3}|ix|x)\b/;
// "Group 2 Chapter 386" -> "Group # Chapter #"
const ANY_NUMBER = /[0-9]+(?:\.[0-9]+)?/g;
// A number after this is the chapter number, even when every similar name has the same one.
const CHAPTER_PREFIX = /(?:\b(?:ch|chap|chapter|ep|episode)\.? *|#)$/;
// "Bonus Chapter: Beach Episode"
const BONUS = /\b(?:extra|bonus|omake|special|side ?story|afterword|interlude)/;
// "Prologue: The Beginning" -> 0
const PROLOGUE = /\b(?:prologue|one.?shot|pilot)\b/;
const ROMAN_NUMERALS = [
  "i",
  "ii",
  "iii",
  "iv",
  "v",
  "vi",
  "vii",
  "viii",
  "ix",
  "x",
];

/** A source chapter as a row: `id` is its url; `number` is negative without one, -1 when neither the source nor the name gives one, or a negative the source gave (like -2). */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  date: string;
  scanlator: string | null;
  memo: string | null;
}

/** The volume and chapter number recognized for a chapter, e.g. "10.5" or "19a", null when there is none. */
export interface ChapterNumbering {
  volume: string | null;
  chapter: string | null;
}

/** A chapter as the recognition reads it: its name and the number its source gave. */
type NamedChapter = Pick<SourceChapter, "name" | "number">;

/** A recognized number, with the letter of a sub-chapter like the a in 19a. */
interface RecognizedNumber {
  value: number;
  letter?: string;
}

/**
 * The chapter number, Mihon's way: the source's when it gave one, else read from the name without the manga title
 * ("Capítulo 51" -> 51, "Vol.2 Ch.10" -> 10, "19a" -> 19.1, "12 extra" -> 12.99), else -1.
 * @see https://github.com/mihonapp/mihon/blob/main/domain/src/main/java/tachiyomi/domain/chapter/service/ChapterRecognition.kt
 */
export function parseChapterNumber(
  mangaTitle: string,
  chapterName: string,
  chapterNumber?: number,
): number {
  if (chapterNumber !== undefined && isKnown(chapterNumber))
    return chapterNumber;
  const found = parseName(cleanName(mangaTitle, chapterName));
  return found ? toDouble(numberText(found)) : (chapterNumber ?? -1);
}

/**
 * The numbers of `chapters`, given from the most to the least recent, Mihon's way over the whole list: numbers every
 * similar name shares aren't the chapter number, and chapters without one are numbered after the chapters around them.
 * Numbers the source gave are kept.
 * @see https://github.com/mihonapp/mihon/blob/main/domain/src/main/java/tachiyomi/domain/chapter/service/ChapterRecognition.kt
 */
export function parseChapterNumbers(
  mangaTitle: string,
  chapters: NamedChapter[],
): ChapterNumbering[] {
  const names = chapters.map((chapter) => cleanName(mangaTitle, chapter.name));
  // Taken out before reading the names, so a number like the 2 in "Group 2 Chapter 386" can't be picked.
  const sharedNumbers = findSharedNumbers(names, chapters);
  const chapterNumbers = chapters.map((chapter, index) =>
    isKnown(chapter.number)
      ? { value: chapter.number }
      : parseName(removeRanges(names[index], sharedNumbers[index])),
  );
  // Only from the name: newer chapters may not be in a volume yet, so neighbours don't tell.
  const volumes = names.map((name) => {
    const found = [...name.matchAll(VOLUME)][0];
    return found ? Number(found[1]) : null;
  });

  fillChapterNumbers(names, chapterNumbers, volumes);
  return chapters.map((_, index) => {
    const volume = volumes[index];
    const chapter = chapterNumbers[index];
    return {
      volume: volume === null ? null : format(volume),
      chapter: chapter ? numberText(chapter) : null,
    };
  });
}

// -1 and below mean the source gave none, except -2 which some sources use on purpose.
const isKnown = (number: number) => number === -2 || number > -1;

const cleanName = (mangaTitle: string, chapterName: string) =>
  chapterName.toLowerCase().replaceAll(mangaTitle.toLowerCase(), "");

const numberText = ({ value, letter }: RecognizedNumber) =>
  format(value) + (letter ?? "");

// Kotlin's round(): to the nearest, ties to even.
function roundHalfEven(value: number): number {
  const rounded = Math.round(value);
  return rounded - value === 0.5 && rounded % 2 !== 0 ? rounded - 1 : rounded;
}

// shortcut: Mihon's DecimalFormat("#.###") rounds exact ties half-even, toFixed rounds them up.
const format = (value: number) => String(Number(value.toFixed(3)));

/** A recognized number as a double. A letter only counts without decimals, from .1 for a up to .9 for i, e.g. 19a -> 19.1 and 1.5a -> 1.5. */
export function toDouble(number: string): number {
  const letter = /[a-z]$/.test(number) ? number.slice(-1) : undefined;
  const value = Number(letter ? number.slice(0, -1) : number);
  const tenths = letter ? letter.charCodeAt(0) - 96 : undefined;
  return tenths !== undefined && tenths < 10 && !number.includes(".")
    ? value + tenths / 10
    : value;
}

/** Replaces each [start, end) range with a space, from the last so the earlier ones stay where they are. */
function removeRanges(name: string, ranges: [number, number][]): string {
  return [...ranges]
    .sort((a, b) => b[0] - a[0])
    .reduce(
      (text, [start, end]) => `${text.slice(0, start)} ${text.slice(end)}`,
      name,
    );
}

/** The numbers the same in every name of a group of at least three names that only differ in their numbers, e.g. the 2 in "Group 2 Chapter 385"; chapters with a number from the source are left out. */
function findSharedNumbers(
  names: string[],
  chapters: NamedChapter[],
): [number, number][][] {
  const matches = names.map((name) => [...name.matchAll(ANY_NUMBER)]);
  const sharedNumbers: [number, number][][] = names.map(() => []);
  // Grouped by all but their numbers, so that the nth number of each name means the same thing.
  const groups = new Map<string, number[]>();
  names.forEach((name, index) => {
    if (isKnown(chapters[index].number)) return;
    const key = name.replace(ANY_NUMBER, "#");
    const group = groups.get(key);
    if (group) group.push(index);
    else groups.set(key, [index]);
  });
  for (const group of groups.values()) {
    // Fewer names could share a number by chance.
    if (group.length < 3) continue;
    const first = matches[group[0]];
    const slots = first.map((_, slot) => slot);
    const sharedSlots = slots.filter((slot) =>
      group.every((index) => matches[index][slot]?.[0] === first[slot][0]),
    );
    // Something has to be left to tell the chapters apart.
    if (sharedSlots.length === slots.length) continue;
    // Parts of a chapter share its number, e.g. the 5 of "Chapter 5 Part 1" and "Chapter 5 Part 2".
    const removableSlots = sharedSlots.filter(
      (slot) =>
        !CHAPTER_PREFIX.test(names[group[0]].slice(0, first[slot].index)),
    );
    for (const index of group)
      sharedNumbers[index] = removableSlots.map((slot) => {
        const match = matches[index][slot];
        return [match.index, match.index + match[0].length];
      });
  }
  return sharedNumbers;
}

/**
 * Numbers runs of chapters without a number after the chapters around them, only within a volume since chapter numbers
 * may start over in the next one:
 * - between two chapters, the missing whole numbers when they fit, e.g. 2, ?, 4 -> 3, or else 10, ?, 11 -> 10.5
 * - after the newest chapter, only bonus chapters, e.g. 100, Afterword -> 100.5
 * - before the oldest chapter, only a prologue, which gets 0, and volume 0 when the chapter after it has a volume
 */
function fillChapterNumbers(
  names: string[],
  chapterNumbers: (RecognizedNumber | null)[],
  volumes: (number | null)[],
): void {
  for (const [first, last] of nullRuns(chapterNumbers)) {
    const count = last - first + 1;
    // A -2 from the source says nothing about where a chapter is, so it can't be numbered after.
    const newer = known(chapterNumbers[first - 1]);
    const older = known(chapterNumbers[last + 1]);
    const olderVolume = volumes[last + 1] ?? null;
    let bonuses = 0;
    for (let index = first; index <= last; index++)
      if (BONUS.test(names[index])) bonuses++;
    if (newer && older) {
      const isSameVolume =
        volumes[first - 1] === olderVolume &&
        isWithinVolume(volumes, first, last, olderVolume);
      // Out of order chapters tell nothing about the ones between them.
      if (newer.value <= older.value || !isSameVolume) continue;
      const isWhole = [newer, older].every(
        (number) => number.letter === undefined && number.value % 1 === 0,
      );
      // Bonus chapters aren't missing chapters even when they would fit, e.g. 2, Bonus, 4 -> 2.5.
      if (bonuses === 0 && isWhole && newer.value - older.value - 1 === count) {
        for (let index = first; index <= last; index++)
          chapterNumbers[index] = { value: older.value + (last + 1 - index) };
      } else {
        // Never past the next whole number, which may still be a chapter to come.
        fillBetween(
          chapterNumbers,
          first,
          last,
          older.value,
          Math.min(newer.value, Math.floor(older.value) + 1),
        );
      }
    } else if (older) {
      // Newer chapters without a number may as well be announcements.
      if (bonuses < count || !isWithinVolume(volumes, first, last, olderVolume))
        continue;
      fillBetween(
        chapterNumbers,
        first,
        last,
        older.value,
        Math.floor(older.value) + 1,
      );
    } else if (newer && newer.value > 0) {
      // When the first chapter is already 0, that's the prologue.
      for (let index = first; index <= last; index++) {
        if (!PROLOGUE.test(names[index])) continue;
        chapterNumbers[index] = { value: 0 };
        if (volumes[index] === null && volumes[first - 1] !== null)
          volumes[index] = 0;
      }
    }
  }
}

const known = (number: RecognizedNumber | null | undefined) =>
  number && number.value >= 0 ? number : null;

/** The [first, last] ranges of consecutive chapters without a number. */
function nullRuns(
  chapterNumbers: (RecognizedNumber | null)[],
): [number, number][] {
  const runs: [number, number][] = [];
  let start = 0;
  while (start < chapterNumbers.length) {
    if (chapterNumbers[start] !== null) {
      start++;
      continue;
    }
    let end = start;
    while (end < chapterNumbers.length && chapterNumbers[end] === null) end++;
    runs.push([start, end - 1]);
    start = end;
  }
  return runs;
}

/** Whether the chapters of the run are in no volume or in `volume`, the one of the chapters their numbers come from. */
function isWithinVolume(
  volumes: (number | null)[],
  first: number,
  last: number,
  volume: number | null,
): boolean {
  for (let index = first; index <= last; index++)
    if (volumes[index] !== null && volumes[index] !== volume) return false;
  return true;
}

/** Numbers the run between `lower` and `upper`, the least recent getting the lowest: .5, .6 and so on after the whole number, e.g. 10, ?, ?, 11 -> 10.5, 10.6, or evenly spread when those don't fit. */
function fillBetween(
  chapterNumbers: (RecognizedNumber | null)[],
  first: number,
  last: number,
  lower: number,
  upper: number,
): void {
  const count = last - first + 1;
  const tenths = [5, 6, 7, 8, 9]
    .map((tenth) => Math.floor(lower) + tenth / 10)
    .filter((tenth) => tenth > lower && tenth < upper);
  if (tenths.length >= count) {
    // Rounded since tenths can't be exact doubles, e.g. 10 + 0.6.
    for (let index = last; index >= first; index--)
      chapterNumbers[index] = {
        value: roundHalfEven(tenths[last - index] * 10) / 10,
      };
    return;
  }
  // Tenths run out after e.g. a 2.9 or past five chapters, and the chapters still have to fit below upper.
  const step = (upper - lower) / (count + 1);
  for (let index = first; index <= last; index++)
    chapterNumbers[index] = {
      value: roundHalfEven((lower + step * (last + 1 - index)) * 1000) / 1000,
    };
}

/** The chapter number in a lowercased name without the manga title; a part after it becomes its letter (1.5 Part I -> 1.5a). */
function parseName(name: string): RecognizedNumber | null {
  // The volume can't also be the chapter number.
  const withoutVolume = name.replace(VOLUME, " ");
  const partMatch = withoutVolume.match(PART);
  const part = partMatch ? parsePart(partMatch[1]) : 0;
  if (partMatch?.index !== undefined && part >= 1 && part <= 26) {
    const number = parseNumber(
      withoutVolume.slice(0, partMatch.index) +
        withoutVolume.slice(partMatch.index + partMatch[0].length),
    );
    // A letter written in the number is what the source numbers the chapter by.
    if (number)
      return number.letter
        ? number
        : { ...number, letter: String.fromCharCode(96 + part) };
  }
  // Without another number, e.g. "Part 3", the part is the chapter number.
  return parseNumber(withoutVolume);
}

function parsePart(part: string): number {
  const number = Number(part);
  return Number.isNaN(number) ? ROMAN_NUMERALS.indexOf(part) + 1 : number;
}

/** The number after "ch." or else the first one, leaving out version tags when there are several. */
function parseNumber(name: string): RecognizedNumber | null {
  // Some sources write decimals and letters with these, e.g. 300,a and 122-a.
  const cleanName = name
    .trim()
    .replaceAll(",", ".")
    .replaceAll("-", ".")
    .replace(UNWANTED_WHITE_SPACE, "");
  const numbers = [...cleanName.matchAll(NUMBER)];
  if (numbers.length > 1) {
    const withoutTags = cleanName.replace(UNWANTED, "");
    const found =
      withoutTags.match(BASIC) ?? [...withoutTags.matchAll(NUMBER)][0];
    if (found) return toRecognizedNumber(found);
  }
  return numbers[0] ? toRecognizedNumber(numbers[0]) : null;
}

/** 12.5 -> 12.5, 12.extra -> 12.99, 12.a -> 12a. */
function toRecognizedNumber([
  ,
  whole,
  decimal = "",
  alpha = "",
]: RegExpMatchArray): RecognizedNumber {
  const value = Number(whole) + (decimal ? Number(decimal) : 0);
  if (!decimal && alpha.includes("extra")) return { value: value + 0.99 };
  if (!decimal && alpha.includes("omake")) return { value: value + 0.98 };
  if (!decimal && alpha.includes("special")) return { value: value + 0.97 };
  // Only up to i, like the decimals they used to stand for, since others are rather words like 5v2.
  const letter = alpha.replace(/^\.+/, "");
  return /^[a-i]$/.test(letter) ? { value, letter } : { value };
}

/** The rows of a manga's chapters, numbered over the whole list like Mihon's chapter sync. */
export function toChapters(
  sourceChapters: SourceChapter[],
  mangaTitle: string,
): Chapter[] {
  // Like Mihon, a repeated url keeps its first chapter, so repeats neither group nor neighbour.
  const urls = new Set<string>();
  const chapters = sourceChapters.filter(
    (c) => !urls.has(c.url) && Boolean(urls.add(c.url)),
  );
  // Formatting to 3 decimals also drops the float32 noise of a source number (10.1 as 10.100000381469727).
  const numberings = parseChapterNumbers(mangaTitle, chapters);
  return chapters.map((chapter, index) => ({
    id: chapter.url,
    number: toDouble(numberings[index].chapter ?? "-1"),
    title: chapter.name,
    date:
      formatDate(
        chapter.dateUpload ? new Date(chapter.dateUpload) : undefined,
      ) ?? "",
    scanlator: chapter.scanlator,
    memo: chapter.memo,
  }));
}

/** A chapter without a number (negative) is never read; progress 0 reads nothing, else chapters up to it. */
export function isRead(progress: number, number: number): boolean {
  return number >= 0 && progress > 0 && number <= progress;
}

/** Chapter numbers past the progress, each once (a chapter can come from two scanlators); unnumbered rows can't be told apart, so they don't count. */
export function unreadCount(
  chapters: Pick<Chapter, "number">[],
  progress: number,
): number {
  const unread = new Set<number>();
  for (const { number } of chapters)
    if (number >= 0 && !isRead(progress, number)) unread.add(number);
  return unread.size;
}
