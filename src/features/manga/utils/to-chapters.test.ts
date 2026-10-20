import { describe, expect, it } from "bun:test";
import type { SourceChapter } from "@/features/extensions";
import {
  isRead,
  parseChapterNumber,
  parseChapterNumbers,
  toChapters,
  toDouble,
} from "./to-chapters";

const chapter = (overrides: Partial<SourceChapter>): SourceChapter => ({
  url: "/c/1",
  name: "Chapter 1",
  number: 1,
  scanlator: null,
  dateUpload: 0,
  memo: null,
  ...overrides,
});

describe("parseChapterNumber", () => {
  it("reads the chapter from its name", () => {
    expect(parseChapterNumber("", "Ch.4")).toBe(4);
    expect(parseChapterNumber("", "Chapter 12.5")).toBe(12.5);
    expect(parseChapterNumber("", "Vol.2 Ch.10")).toBe(10);
    expect(parseChapterNumber("", "Capítulo 51")).toBe(51);
    expect(parseChapterNumber("", "Cap. 12.5")).toBe(12.5);
  });

  it("is -1 when the name has no chapter", () => {
    expect(parseChapterNumber("", "Oneshot")).toBe(-1);
  });

  it("keeps the number the source gave", () => {
    expect(parseChapterNumber("", "Vol.1 Chapter 3", 7)).toBe(7);
    expect(parseChapterNumber("", "Chapter 3", -2)).toBe(-2);
    expect(parseChapterNumber("", "Chapter 2", -1)).toBe(2);
    expect(parseChapterNumber("", "Foo", -1)).toBe(-1);
  });

  // Mihon's ChapterRecognitionTest, the cases a single name decides; letters count as tenths (4a is 4.1).
  const mihon: [string, string, number][] = [
    ["Mokushiroku Alice", "Mokushiroku Alice Vol.1 Ch.4: Misrepresentation", 4],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol. 1 Ch. 4: Misrepresentation",
      4,
    ],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch.4.1: Misrepresentation",
      4.1,
    ],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch.4.4: Misrepresentation",
      4.4,
    ],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch.4.a: Misrepresentation",
      4.1,
    ],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch.4.b: Misrepresentation",
      4.2,
    ],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch.4.extra: Misrepresentation",
      4.99,
    ],
    ["Bleach", "Bleach 567 Down With Snowwhite", 567],
    ["Bleach", "Bleach 567.1 Down With Snowwhite", 567.1],
    ["Bleach", "Bleach 567.4 Down With Snowwhite", 567.4],
    ["Bleach", "Bleach 567.a Down With Snowwhite", 567.1],
    ["Bleach", "Bleach 567.b Down With Snowwhite", 567.2],
    ["Bleach", "Bleach 567.extra Down With Snowwhite", 567.99],
    ["Solanin", "Solanin 028 Vol. 2", 28],
    ["Solanin", "Solanin 028.1 Vol. 2", 28.1],
    ["Solanin", "Solanin 028.4 Vol. 2", 28.4],
    ["Solanin", "Solanin 028.a Vol. 2", 28.1],
    ["Solanin", "Solanin 028.b Vol. 2", 28.2],
    ["Solanin", "Solanin 028.extra Vol. 2", 28.99],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028", 28],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028.1", 28.1],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028.4", 28.4],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028.a", 28.1],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028.b", 28.2],
    ["Onepunch-Man", "Onepunch-Man Punch Ver002 028.extra", 28.99],
    ["random", "Vol.1 Ch.5v.2: Alones", 5],
    ["Ayame 14", "Ayame 14 1 - The summer of 14", 1],
    [
      "Mokushiroku Alice",
      "Mokushiroku Alice Vol.1 Ch. 4: Misrepresentation",
      4,
    ],
    ["Ayame 14", "Vol.1 Ch.1: March 25 (First Day Cohabiting)", 1],
    ["random", "Vol.001 Ch.003: Kaguya Doesn't Know Much", 3],
    [
      "Onepunch-Man",
      "Onepunch-Man Punch Ver002 086 : Creeping Darkness [3]",
      86,
    ],
    ["Ansatsu Kyoushitsu", "Ansatsu Kyoushitsu 011v002: Assembly Time", 11],
    ["Tokyo ESP", "Tokyo ESP 027: Part 002: Chapter 001", 27.2],
    ["One-punch Man", "Mag Version 195.5", 195.5],
    ["random", "Foo", -1],
    ["random", "Fairy Tail 404: 00:00", 404],
    ["random", "Asu No Yoichi 19a", 19.1],
    ["random", "Asu No Yoichi 19i", 19.9],
    ["Fairy Tail", "Fairy Tail 404.extravol002", 404.99],
    ["Fairy Tail", "Fairy Tail 404 extravol002", 404.99],
    ["Fairy Tail", "Fairy Tail 404.omakevol002", 404.98],
    ["Fairy Tail", "Fairy Tail 404 omakevol002", 404.98],
    ["Fairy Tail", "Fairy Tail 404.specialvol002", 404.97],
    ["Fairy Tail", "Fairy Tail 404 specialvol002", 404.97],
    ["One Piece", "One Piece 300,a", 300.1],
    ["One Piece", "One Piece Ch,123,extra", 123.99],
    ["One Piece", "One Piece the sunny, goes swimming 024,005", 24.005],
    ["Solo Leveling", "ch 122-a", 122.1],
    ["Solo Leveling", "Solo Leveling Ch.123-extra", 123.99],
    ["Solo Leveling", "Solo Leveling, 024-005", 24.005],
    ["Solo Leveling", "Ch.191-200 Read Online", 191.2],
    ["D.I.C.E", "D.I.C.E[Season 001] Ep. 007", 7],
    ["The Gamer", "S3 - Chapter 20", 20],
    ["One Outs", "One Outs 001", 1],
    ["The Sister of the Woods with a Thousand Young", "The 1st Night", 1],
    ["The Sister of the Woods with a Thousand Young", "The 2nd Night", 2],
    ["The Sister of the Woods with a Thousand Young", "The 3rd Night", 3],
    ["The Sister of the Woods with a Thousand Young", "The 4th Night", 4],
    ["", "Chapter 1.5 Part I", 1.5],
    ["", "Chapter 1.5 Part II", 1.5],
    ["", "Chapter 12 Part 3", 12.3],
    ["", "Vol.2 Chapter 7 - Part IV", 7.4],
    ["", "Part 3", 3],
    ["Mokushiroku Alice", "Mokushiroku Alice Vol.3", -1],
    ["Mokushiroku Alice", "Vol.3 12", 12],
    ["", "Vol-3 Chapter 2", 2],
    ["", "Mob's 100", 100],
    ["", "Vol.2 Ch.5", 5],
    ["", "Vol.2 Ch.3", 3],
    ["", "Ch.4", 4],
    ["", "Chapter 5 Part 3", 5.3],
  ];

  it.each(mihon)("reads %p / %p like Mihon", (title, name, number) => {
    expect(parseChapterNumber(title, name)).toBe(number);
  });
});

// Mihon's ChapterRecognitionTest: names from the most to the least recent, each with its [volume, chapter].
const numbers = (
  mangaTitle: string,
  ...expected: [string, string | null, string | null][]
) =>
  expect(
    parseChapterNumbers(
      mangaTitle,
      expected.map(([name]) => ({ name, number: -1 })),
    ),
  ).toEqual(expected.map(([, volume, chapter]) => ({ volume, chapter })));

describe("parseChapterNumbers", () => {
  it("Basic Ch prefix", () => {
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4: Misrepresentation",
      "1",
      "4",
    ]);
  });

  it("Basic Ch prefix with space after period", () => {
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol. 1 Ch. 4: Misrepresentation",
      "1",
      "4",
    ]);
  });

  it("Basic Ch prefix with decimal", () => {
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4.1: Misrepresentation",
      "1",
      "4.1",
    ]);
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4.4: Misrepresentation",
      "1",
      "4.4",
    ]);
  });

  it("Basic Ch prefix with alpha postfix", () => {
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4.a: Misrepresentation",
      "1",
      "4a",
    ]);
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4.b: Misrepresentation",
      "1",
      "4b",
    ]);
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch.4.extra: Misrepresentation",
      "1",
      "4.99",
    ]);
  });

  it("Name containing one number", () => {
    numbers("Bleach", ["Bleach 567 Down With Snowwhite", null, "567"]);
  });

  it("Name containing one number and decimal", () => {
    numbers("Bleach", ["Bleach 567.1 Down With Snowwhite", null, "567.1"]);
    numbers("Bleach", ["Bleach 567.4 Down With Snowwhite", null, "567.4"]);
  });

  it("Name containing one number and alpha", () => {
    numbers("Bleach", ["Bleach 567.a Down With Snowwhite", null, "567a"]);
    numbers("Bleach", ["Bleach 567.b Down With Snowwhite", null, "567b"]);
    numbers("Bleach", ["Bleach 567.extra Down With Snowwhite", null, "567.99"]);
  });

  it("Chapter containing manga title and number", () => {
    numbers("Solanin", ["Solanin 028 Vol. 2", "2", "28"]);
  });

  it("Chapter containing manga title and number decimal", () => {
    numbers("Solanin", ["Solanin 028.1 Vol. 2", "2", "28.1"]);
    numbers("Solanin", ["Solanin 028.4 Vol. 2", "2", "28.4"]);
  });

  it("Chapter containing manga title and number alpha", () => {
    numbers("Solanin", ["Solanin 028.a Vol. 2", "2", "28a"]);
    numbers("Solanin", ["Solanin 028.b Vol. 2", "2", "28b"]);
    numbers("Solanin", ["Solanin 028.extra Vol. 2", "2", "28.99"]);
  });

  it("Extreme case", () => {
    numbers("Onepunch-Man", ["Onepunch-Man Punch Ver002 028", null, "28"]);
  });

  it("Extreme case with decimal", () => {
    numbers("Onepunch-Man", ["Onepunch-Man Punch Ver002 028.1", null, "28.1"]);
    numbers("Onepunch-Man", ["Onepunch-Man Punch Ver002 028.4", null, "28.4"]);
  });

  it("Extreme case with alpha", () => {
    numbers("Onepunch-Man", ["Onepunch-Man Punch Ver002 028.a", null, "28a"]);
    numbers("Onepunch-Man", ["Onepunch-Man Punch Ver002 028.b", null, "28b"]);
    numbers("Onepunch-Man", [
      "Onepunch-Man Punch Ver002 028.extra",
      null,
      "28.99",
    ]);
  });

  it("Chapter containing dot v2", () => {
    numbers("random", ["Vol.1 Ch.5v.2: Alones", "1", "5"]);
  });

  it("Number in manga title", () => {
    numbers("Ayame 14", ["Ayame 14 1 - The summer of 14", null, "1"]);
  });

  it("Space between ch x", () => {
    numbers("Mokushiroku Alice", [
      "Mokushiroku Alice Vol.1 Ch. 4: Misrepresentation",
      "1",
      "4",
    ]);
  });

  it("Chapter title with ch substring", () => {
    numbers("Ayame 14", [
      "Vol.1 Ch.1: March 25 (First Day Cohabiting)",
      "1",
      "1",
    ]);
  });

  it("Chapter containing multiple zeros", () => {
    numbers("random", ["Vol.001 Ch.003: Kaguya Doesn't Know Much", "1", "3"]);
  });

  it("Chapter with version before number", () => {
    numbers("Onepunch-Man", [
      "Onepunch-Man Punch Ver002 086 : Creeping Darkness [3]",
      null,
      "86",
    ]);
  });

  it("Version attached to chapter number", () => {
    numbers("Ansatsu Kyoushitsu", [
      "Ansatsu Kyoushitsu 011v002: Assembly Time",
      null,
      "11",
    ]);
  });

  it("Number after manga title with chapter in chapter title case", () => {
    numbers("Tokyo ESP", ["Tokyo ESP 027: Part 002: Chapter 001", null, "27b"]);
  });

  it("Number after unwanted tag", () => {
    numbers("One-punch Man", ["Mag Version 195.5", null, "195.5"]);
  });

  it("Unparseable chapter", () => {
    numbers("random", ["Foo", null, null]);
  });

  it("Chapter with time in title", () => {
    numbers("random", ["Fairy Tail 404: 00:00", null, "404"]);
  });

  it("Chapter with alpha without dot", () => {
    numbers("random", ["Asu No Yoichi 19a", null, "19a"]);
  });

  it("Chapter title containing extra and vol", () => {
    numbers("Fairy Tail", ["Fairy Tail 404.extravol002", null, "404.99"]);
    numbers("Fairy Tail", ["Fairy Tail 404 extravol002", null, "404.99"]);
  });

  it("Chapter title containing omake (japanese extra) and vol", () => {
    numbers("Fairy Tail", ["Fairy Tail 404.omakevol002", null, "404.98"]);
    numbers("Fairy Tail", ["Fairy Tail 404 omakevol002", null, "404.98"]);
  });

  it("Chapter title containing special and vol", () => {
    numbers("Fairy Tail", ["Fairy Tail 404.specialvol002", null, "404.97"]);
    numbers("Fairy Tail", ["Fairy Tail 404 specialvol002", null, "404.97"]);
  });

  it("Chapter title containing commas", () => {
    numbers("One Piece", ["One Piece 300,a", null, "300a"]);
    numbers("One Piece", ["One Piece Ch,123,extra", null, "123.99"]);
    numbers("One Piece", [
      "One Piece the sunny, goes swimming 024,005",
      null,
      "24.005",
    ]);
  });

  it("Chapter title containing hyphens", () => {
    numbers("Solo Leveling", ["ch 122-a", null, "122a"]);
    numbers("Solo Leveling", ["Solo Leveling Ch.123-extra", null, "123.99"]);
    numbers("Solo Leveling", ["Solo Leveling, 024-005", null, "24.005"]);
    numbers("Solo Leveling", ["Ch.191-200 Read Online", null, "191.2"]);
  });

  it("Chapters containing season", () => {
    numbers("D.I.C.E", ["D.I.C.E[Season 001] Ep. 007", "1", "7"]);
  });

  it("Chapters in format sx - chapter xx", () => {
    numbers("The Gamer", ["S3 - Chapter 20", "3", "20"]);
  });

  it("Chapters ending with s", () => {
    numbers("One Outs", ["One Outs 001", null, "1"]);
  });

  it("Chapters containing ordinals", () => {
    numbers("The Sister of the Woods with a Thousand Young", [
      "The 1st Night",
      null,
      "1",
    ]);
    numbers("The Sister of the Woods with a Thousand Young", [
      "The 2nd Night",
      null,
      "2",
    ]);
    numbers("The Sister of the Woods with a Thousand Young", [
      "The 3rd Night",
      null,
      "3",
    ]);
    numbers("The Sister of the Woods with a Thousand Young", [
      "The 4th Night",
      null,
      "4",
    ]);
  });

  it("Parts are letters", () => {
    numbers("", ["Chapter 1.5 Part I", null, "1.5a"]);
    numbers("", ["Chapter 1.5 Part II", null, "1.5b"]);
    numbers("", ["Chapter 12 Part 3", null, "12c"]);
    numbers("", ["Vol.2 Chapter 7 - Part IV", "2", "7d"]);
    numbers("", ["Part 3", null, "3"]);
  });

  it("Numbers are turned into doubles", () => {
    expect(toDouble("12")).toBe(12);
    expect(toDouble("10.5")).toBe(10.5);
    expect(toDouble("19a")).toBe(19.1);
    expect(toDouble("19i")).toBe(19.9);
    expect(toDouble("1.5a")).toBe(1.5);
    expect(toDouble("-2")).toBe(-2);
  });

  it("Volume is not taken as the chapter number", () => {
    numbers("Mokushiroku Alice", ["Mokushiroku Alice Vol.3", "3", null]);
    numbers("Mokushiroku Alice", ["Vol.3 12", "3", "12"]);
  });

  it("Seasons are volumes", () => {
    numbers("", ["Vol-3 Chapter 2", "3", "2"]);
    numbers("", ["Mob's 100", null, "100"]);
  });

  it("Volumes are only taken from the name", () => {
    numbers(
      "",
      ["Vol.2 Ch.5", "2", "5"],
      ["Ch.4", null, "4"],
      ["Vol.2 Ch.3", "2", "3"],
    );
  });

  it("Numbers every similar name shares are ignored", () => {
    numbers(
      "",
      ["Group 2 Chapter 387", null, "387"],
      ["Group 2 Chapter 386", null, "386"],
      ["Group 2 Chapter 385", null, "385"],
    );
  });

  it("Shared numbers after a chapter prefix are kept", () => {
    numbers(
      "",
      ["Chapter 5 Part 3", null, "5c"],
      ["Chapter 5 Part 2", null, "5b"],
      ["Chapter 5 Part 1", null, "5a"],
    );
  });

  it("Chapters without a number fill the missing whole numbers", () => {
    numbers(
      "",
      ["Chapter 4", null, "4"],
      ["The Return", null, "3"],
      ["Chapter 2", null, "2"],
    );
    numbers(
      "",
      ["Chapter 5", null, "5"],
      ["Rain", null, "4"],
      ["Snow", null, "3"],
      ["Chapter 2", null, "2"],
    );
  });

  it("Chapters without a number go between the chapters around them", () => {
    numbers(
      "",
      ["Chapter 11", null, "11"],
      ["Bonus: Beach Episode", null, "10.5"],
      ["Chapter 10", null, "10"],
    );
    numbers(
      "",
      ["Chapter 13", null, "13"],
      ["Intermission", null, "10.5"],
      ["Chapter 10", null, "10"],
    );
    numbers(
      "",
      ["Chapter 11", null, "11"],
      ["Rain", null, "10.6"],
      ["Snow", null, "10.5"],
      ["Chapter 10", null, "10"],
    );
    numbers(
      "",
      ["Chapter 4", null, "4"],
      ["Side Story", null, "2.5"],
      ["Chapter 2", null, "2"],
    );
    numbers(
      "",
      ["Chapter 3", null, "3"],
      ["Extra", null, "2.6"],
      ["Chapter 2.5", null, "2.5"],
    );
    numbers(
      "",
      ["Chapter 3", null, "3"],
      ["Extra", null, "2.95"],
      ["Chapter 2.9", null, "2.9"],
    );
  });

  it("Chapters without a number at the ends", () => {
    numbers("", ["Afterword", null, "100.5"], ["Chapter 100", null, "100"]);
    numbers(
      "",
      ["Hiatus Announcement", null, null],
      ["Chapter 100", null, "100"],
    );
    numbers("", ["Chapter 1", null, "1"], ["Prologue", null, "0"]);
    numbers("", ["Chapter 1", null, "1"], ["Character Profiles", null, null]);
  });

  it("A prologue before chapters in volumes is in volume 0", () => {
    numbers("", ["Vol.1 Ch.1", "1", "1"], ["Prologue", "0", "0"]);
    numbers("", ["Vol.1 Ch.1", "1", "1"], ["Vol.2 Prologue", "2", "0"]);
  });

  it("Chapters without a number are only numbered within a volume", () => {
    numbers(
      "",
      ["Vol.1 Ch.3", "1", "3"],
      ["Rain", null, "2"],
      ["Vol.1 Ch.1", "1", "1"],
    );
    numbers(
      "",
      ["Vol.2 Ch.3", "2", "3"],
      ["Rain", null, null],
      ["Vol.1 Ch.1", "1", "1"],
    );
    numbers(
      "",
      ["Vol.2 Ch.3", "2", "3"],
      ["Vol.2 Rain", "2", null],
      ["Ch.1", null, "1"],
    );
    numbers(
      "",
      ["Vol.2 Ch.3", "2", "3"],
      ["Vol.1 Rain", "1", null],
      ["Vol.2 Ch.1", "2", "1"],
    );
    numbers("", ["Extra", null, "10.5"], ["Vol.2 Ch.10", "2", "10"]);
    numbers("", ["Vol.2 Extra", "2", "10.5"], ["Vol.2 Ch.10", "2", "10"]);
    numbers("", ["Vol.3 Extra", "3", null], ["Vol.2 Ch.10", "2", "10"]);
  });

  it("Numbers from the source are kept", () => {
    expect(
      parseChapterNumbers("", [
        { name: "Vol.1 Chapter 3", number: 7 },
        { name: "Chapter 2", number: -1 },
      ]),
    ).toEqual([
      { volume: "1", chapter: "7" },
      { volume: null, chapter: "2" },
    ]);
  });

  it("ignores a shared season or title number the old reading took", () => {
    numbers(
      "",
      ["Temporada 2 Capítulo 5", null, "5"],
      ["Temporada 2 Capítulo 4", null, "4"],
      ["Temporada 2 Capítulo 3", null, "3"],
    );
    numbers(
      "Kaiju No. 8",
      ["Kaiju No.8 Chapter 100", null, "100"],
      ["Kaiju No.8 Chapter 99", null, "99"],
      ["Kaiju No.8 Chapter 98", null, "98"],
    );
  });
});

describe("toChapters", () => {
  it("keeps the source order and uses the url as id", () => {
    const result = toChapters(
      [chapter({ url: "/b", number: 2 }), chapter({ url: "/a", number: 1 })],
      "",
    );
    expect(result.map((c) => c.id)).toEqual(["/b", "/a"]);
    expect(result.map((c) => c.number)).toEqual([2, 1]);
  });

  it("falls back to the name when the source gives no number", () => {
    expect(
      toChapters([chapter({ number: -1, name: "Ch.7" })], "")[0].number,
    ).toBe(7);
    expect(
      toChapters([chapter({ number: -1, name: "Oneshot" })], "")[0].number,
    ).toBe(-1);
  });

  it("reads the numbers over the whole list, like Mihon", () => {
    const names = [
      "Group 2 Chapter 11",
      "Bonus",
      "Group 2 Chapter 10",
      "Group 2 Chapter 9",
      "Prologue",
    ];
    expect(
      toChapters(
        names.map((name) => chapter({ url: name, name, number: -1 })),
        "",
      ).map((c) => c.number),
    ).toEqual([11, 10.5, 10, 9, 0]);
  });

  it("drops repeated urls before numbering, keeping the first", () => {
    const rows = toChapters(
      [
        chapter({ url: "/3", name: "Group 2 Chapter 3", number: -1 }),
        chapter({ url: "/2", name: "Group 2 Chapter 2", number: -1 }),
        chapter({ url: "/2", name: "Group 2 Chapter 9", number: -1 }),
      ],
      "",
    );
    expect(rows.map((c) => [c.id, c.number])).toEqual([
      ["/3", 2],
      ["/2", 2],
    ]);
  });

  it("leaves the manga title out of the name", () => {
    expect(
      toChapters([chapter({ number: -1, name: "Ayame 14 1" })], "Ayame 14")[0]
        .number,
    ).toBe(1);
  });

  it("rounds the float noise of the source number", () => {
    expect(
      toChapters([chapter({ number: 10.100000381469727 })], "")[0].number,
    ).toBe(10.1);
  });

  it("leaves the date empty when the source has none", () => {
    expect(toChapters([chapter({ dateUpload: 0 })], "")[0].date).toBe("");
    expect(
      toChapters([chapter({ dateUpload: 1757635200000 })], "")[0].date,
    ).not.toBe("");
  });

  it("copies the scanlator", () => {
    expect(toChapters([chapter({ scanlator: "A" })], "")[0].scanlator).toBe(
      "A",
    );
    expect(
      toChapters([chapter({ scanlator: null })], "")[0].scanlator,
    ).toBeNull();
  });

  it("titles the row with the source's name", () => {
    expect(toChapters([chapter({ name: "Ch.4 - Hello" })], "")[0].title).toBe(
      "Ch.4 - Hello",
    );
  });
});

describe("isRead", () => {
  it("never reads a chapter without a number", () => {
    expect(isRead(0, -1)).toBe(false);
    expect(isRead(5, -1)).toBe(false);
  });

  it("reads chapters up to the progress", () => {
    expect(isRead(13, 13)).toBe(true);
    expect(isRead(13, 14)).toBe(false);
    expect(isRead(13, 12.5)).toBe(true);
    expect(isRead(12, 12.5)).toBe(false);
  });

  it("reads nothing at progress 0 but chapter 0 once started", () => {
    expect(isRead(0, 0)).toBe(false);
    expect(isRead(1, 0)).toBe(true);
  });
});
