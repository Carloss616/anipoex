import { beforeEach, describe, expect, it, mock } from "bun:test";

// File names on the fake disk; a download writes its destination first.
const disk = new Set<string>();
const DAY = 86_400_000;
let downloads = 0;
let cut = false;
class File {
  name: string;
  constructor(dirOrUri: unknown, name?: string) {
    this.name = name ?? String(dirOrUri);
  }
  get uri() {
    return `file:///w/${this.name}`;
  }
  get exists() {
    return disk.has(this.name);
  }
  get modificationTime() {
    return this.name.includes("old") ? Date.now() - 31 * DAY : Date.now();
  }
  delete() {
    disk.delete(this.name);
  }
  moveSync(to: File) {
    disk.delete(this.name);
    disk.add(to.name);
    this.name = to.name;
  }
  copySync(to: File) {
    disk.add(to.name);
  }
  static async downloadFileAsync(_url: string, to: File) {
    downloads++;
    await Promise.resolve();
    disk.add(to.name);
    if (cut) throw new Error("connection reset");
  }
}
class Directory {
  list() {
    return [...disk].map((name) => new File(name));
  }
}
mock.module("expo-file-system", () => ({ Directory, File }));
mock.module("expo-widgets", () => ({ widgetsDirectory: "file:///w" }));

const { widgetFileName, widgetImage } = await import("./widget-image");

beforeEach(() => {
  disk.clear();
  cut = false;
  downloads = 0;
});

describe("widgetFileName", () => {
  it("is stable per url and differs between urls", () => {
    const url = "https://x.test/a.png?x=1";
    expect(widgetFileName(url)).toBe(widgetFileName(url));
    expect(widgetFileName(url)).not.toBe(
      widgetFileName("https://x.test/b.png"),
    );
  });

  it("keeps the path's extension, png when none", () => {
    expect(widgetFileName("https://x.test/a.png?x=1")).toMatch(
      /^img-[0-9a-z]+\.png$/,
    );
    expect(widgetFileName("https://x.test/a.webp")).toMatch(/\.webp$/);
    expect(widgetFileName("https://x.test/cover")).toMatch(/\.png$/);
  });
});

describe("widgetImage", () => {
  const url = "https://x.test/a.png";

  // First: the prune runs once per launch, on the first image.
  it("deletes saved images older than a month, once", async () => {
    for (const name of ["img-old.png", "img-recent.png", "old-layout.json"])
      disk.add(name);
    await widgetImage(url);
    expect(disk.has("img-old.png")).toBe(false);
    expect(disk.has("img-recent.png")).toBe(true);
    expect(disk.has("old-layout.json")).toBe(true);
  });

  it("a cut-off download leaves no file, so the next call retries", async () => {
    cut = true;
    expect(await widgetImage(url)).toBeUndefined();
    expect([...disk]).toEqual([]);
    cut = false;
    expect(await widgetImage(url)).toBe(`file:///w/${widgetFileName(url)}`);
    expect([...disk]).toEqual([widgetFileName(url)]);
  });

  it("downloads an image asked for twice at once only once", async () => {
    const [a, b] = await Promise.all([widgetImage(url), widgetImage(url)]);
    expect(a).toBe(b);
    expect(downloads).toBe(1);
  });

  it("copies a local file instead of downloading it", async () => {
    const local = "file:///data/exts/source-1.png";
    cut = true;
    expect(await widgetImage(local)).toBe(`file:///w/${widgetFileName(local)}`);
    expect([...disk]).toEqual([widgetFileName(local)]);
  });
});
