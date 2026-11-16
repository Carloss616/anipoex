import { afterEach, beforeEach, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  checkRel,
  get,
  isDownloadPath,
  list,
  listAll,
  put,
  remove,
} from "./downloads.js";

const REL = "downloads/Renamed [21]/Source A [1234]/Ch 1 [a1b2c3d4].cbz";
let root;
let packedDir;

beforeEach(async () => {
  const base = await mkdtemp(path.join(tmpdir(), "downloads-"));
  root = path.join(base, "root");
  packedDir = path.join(base, "packed");
  await mkdir(root);
  await mkdir(packedDir);
});

afterEach(() => rm(path.dirname(root), { recursive: true, force: true }));

const pack = async (name, text) => {
  const file = path.join(packedDir, name);
  await writeFile(file, text);
  return pathToFileURL(file).toString();
};

test("checkRel rejects", () => {
  for (const rel of [
    "../x.cbz",
    "/abs.cbz",
    "downloads/a.txt",
    "sync/a.cbz",
    "downloads/a/../../b.cbz",
  ]) {
    expect(() => checkRel(rel)).toThrow();
  }
  expect(checkRel(REL)).toBe(REL);
});

test("list by ids", async () => {
  await put(root, REL, await pack("a.cbz", "x"), packedDir);
  expect(await list(root, 21, "1234")).toEqual([
    { hash: "a1b2c3d4", paths: [REL], local: true },
  ]);
  expect(await list(root, 22, "1234")).toEqual([]);
  expect(await listAll(root)).toEqual([REL]);
});

test("listAll skips files outside the app's layout", async () => {
  await put(root, REL, await pack("a.cbz", "x"), packedDir);
  for (const rel of [
    "downloads/Some comic.cbz",
    "downloads/x/y.cbz",
    "downloads/Renamed [21]/Source A [1234]/Ch 2 [vol 2].cbz",
    "downloads/Renamed [21]/Source A [1234]/x/Ch 3 [b1b2c3d4].cbz",
  ]) {
    await mkdir(path.dirname(path.join(root, rel)), { recursive: true });
    await writeFile(path.join(root, rel), "x");
  }
  expect(await listAll(root)).toEqual([REL]);
  expect(
    isDownloadPath("downloads/Title/Source A [1234]/Ch [a1b2c3d4].cbz"),
  ).toBe(false);
});

test("put refuses a file outside packedDir", async () => {
  const outside = path.join(path.dirname(root), "evil.cbz");
  await writeFile(outside, "x");
  await expect(
    put(root, REL, pathToFileURL(outside).toString(), packedDir),
  ).rejects.toThrow("Not a packed chapter");
});

test("put copies another root's download, for a move", async () => {
  const other = path.join(path.dirname(root), "other");
  await put(other, REL, await pack("a.cbz", "x"), packedDir);
  await put(root, REL, await get(other, REL), packedDir);
  expect(await readFile(path.join(root, REL), "utf8")).toBe("x");
  expect(existsSync(path.join(other, REL))).toBe(true);
});

test("put refuses a cbz under downloads/ that isn't a download path", async () => {
  const loose = path.join(path.dirname(root), "downloads", "loose.cbz");
  await mkdir(path.dirname(loose));
  await writeFile(loose, "x");
  await expect(
    put(root, REL, pathToFileURL(loose).toString(), packedDir),
  ).rejects.toThrow("Not a packed chapter");
});

test("put replaces through a temp file", async () => {
  await put(root, REL, await pack("a.cbz", "one"), packedDir);
  await put(root, REL, await pack("b.cbz", "two"), packedDir);
  expect(await readFile(path.join(root, REL), "utf8")).toBe("two");
  const temp = path.join(root, path.dirname(REL), ".Ch 1 [a1b2c3d4].cbz.tmp");
  expect(existsSync(temp)).toBe(false);
});

test("get returns a file url", async () => {
  await put(root, REL, await pack("a.cbz", "x"), packedDir);
  expect(await get(root, REL)).toBe(
    pathToFileURL(path.join(root, REL)).toString(),
  );
});

test("remove prunes", async () => {
  await put(root, REL, await pack("a.cbz", "x"), packedDir);
  await remove(root, REL);
  expect(existsSync(path.join(root, "downloads"))).toBe(true);
  expect(existsSync(path.join(root, "downloads/Renamed [21]"))).toBe(false);
});
