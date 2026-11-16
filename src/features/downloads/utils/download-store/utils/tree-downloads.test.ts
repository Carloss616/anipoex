import { expect, test } from "bun:test";
import { treeDownloads } from "./tree-downloads";

const file = (path: string, placeholder = false) => ({ path, placeholder });
const tree = [
  file("downloads/Title A [7]/Source A [source-1]/Ch 1 [aaaaaaaa].cbz"),
  file("downloads/Title A [7]/Source A [source-1]/Ch 2 [bbbbbbbb].cbz", true),
  file("downloads/Title A [7]/Source A [source-1]/Ch 2 [bbbbbbbb] 2.cbz"),
  file("downloads/Title A [7]/Source B [source-2]/Ch 1 [cccccccc].cbz"),
  file("downloads/Title B [8]/Source A [source-1]/Ch 1 [dddddddd].cbz"),
  file("downloads/Title A [7]/notes.txt"),
];

test("picks the manga and source folders by id and groups by hash", () => {
  const found = treeDownloads(tree, 7, "source-1");
  expect(found.map((d) => [d.hash, d.paths.length, d.local])).toEqual([
    ["aaaaaaaa", 1, true],
    ["bbbbbbbb", 2, false],
  ]);
  expect(found[0].paths[0]).toBe(tree[0].path);
});

test("is empty for an unknown manga or source", () => {
  expect(treeDownloads(tree, 9, "source-1")).toEqual([]);
  expect(treeDownloads(tree, 7, "source-9")).toEqual([]);
});
