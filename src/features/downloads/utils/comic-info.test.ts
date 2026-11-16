import { describe, expect, it } from "bun:test";
import type { QueuedDownload } from "../state/download-queue";
import { comicInfo } from "./comic-info";

const item = (
  chapter: Partial<QueuedDownload["chapter"]> = {},
): QueuedDownload => ({
  key: "21/1234/abcd0123",
  order: 0,
  state: "queued",
  manga: { id: 21, title: `Tom & "Jerry's" <Show>` },
  source: { id: "1234", name: "Source A" },
  chapter: {
    url: "https://example.com/c/1?a=1&b=2",
    name: "Chapter 1",
    number: 1.5,
    scanlator: "Group A",
    memo: null,
    ...chapter,
  },
});

describe("comicInfo", () => {
  it("writes the fields and escapes them", () => {
    const xml = comicInfo(item());
    expect(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>')).toBe(true);
    expect(xml).toContain(
      "<Series>Tom &amp; &quot;Jerry&apos;s&quot; &lt;Show&gt;</Series>",
    );
    expect(xml).toContain("<Number>1.5</Number>");
    expect(xml).toContain("<Title>Chapter 1</Title>");
    expect(xml).toContain("<ScanInformation>Group A</ScanInformation>");
    expect(xml).toContain("<Web>https://example.com/c/1?a=1&amp;b=2</Web>");
  });

  it("leaves out a null scanlator and an unknown number", () => {
    const xml = comicInfo(item({ scanlator: null, number: -1 }));
    expect(xml).not.toContain("ScanInformation");
    expect(xml).not.toContain("<Number>");
  });
});
