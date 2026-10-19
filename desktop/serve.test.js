import { afterAll, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { resolveAsset } from "./serve.js";

const parent = mkdtempSync(path.join(tmpdir(), "serve-"));
const root = path.join(parent, "web");
const FILES = [
  "index.html",
  "extensions/repos.html",
  "extensions/index.html",
  "manga/[id].html",
  "_expo/static/js/web/a.js",
];

for (const file of FILES) {
  mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  writeFileSync(path.join(root, file), file);
}
writeFileSync(path.join(parent, "secret"), "secret");

afterAll(() => rmSync(parent, { recursive: true, force: true }));

test("root", () => {
  expect(resolveAsset(root, "/")).toBe(path.join(root, "index.html"));
});

test("folderIndex", () => {
  expect(resolveAsset(root, "/extensions")).toBe(
    path.join(root, "extensions/index.html"),
  );
});

test("routeHtml", () => {
  expect(resolveAsset(root, "/extensions/repos")).toBe(
    path.join(root, "extensions/repos.html"),
  );
});

test("exactFile", () => {
  expect(resolveAsset(root, "/_expo/static/js/web/a.js")).toBe(
    path.join(root, "_expo/static/js/web/a.js"),
  );
});

test("clientRoute", () => {
  expect(resolveAsset(root, "/manga/106758")).toBe(
    path.join(root, "index.html"),
  );
});

test("encodedName", () => {
  expect(resolveAsset(root, "/manga/%5Bid%5D.html")).toBe(
    path.join(root, "manga/[id].html"),
  );
});

test("traversal", () => {
  expect(resolveAsset(root, "/../secret")).toBeNull();
  expect(resolveAsset(root, "/%2e%2e/secret")).toBeNull();
  expect(resolveAsset(root, "/a/../../secret")).toBeNull();
});
