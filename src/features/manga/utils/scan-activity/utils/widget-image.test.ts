import { beforeEach, describe, expect, it, mock } from "bun:test";

// File names on the fake disk; a download writes its destination first.
const disk = new Set<string>();
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
    disk.add(to.name);
    if (cut) throw new Error("connection reset");
  }
}
mock.module("expo-file-system", () => ({ Directory: class {}, File }));
mock.module("expo-widgets", () => ({ widgetsDirectory: "file:///w" }));

const { widgetFileName, widgetImage } = await import("./widget-image");

beforeEach(() => {
  disk.clear();
  cut = false;
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

  it("a cut-off download leaves no file, so the next call retries", async () => {
    cut = true;
    expect(await widgetImage(url)).toBeUndefined();
    expect([...disk]).toEqual([]);
    cut = false;
    expect(await widgetImage(url)).toBe(`file:///w/${widgetFileName(url)}`);
    expect([...disk]).toEqual([widgetFileName(url)]);
  });

  it("copies a local file instead of downloading it", async () => {
    const local = "file:///data/exts/source-1.png";
    cut = true;
    expect(await widgetImage(local)).toBe(`file:///w/${widgetFileName(local)}`);
    expect([...disk]).toEqual([widgetFileName(local)]);
  });
});
