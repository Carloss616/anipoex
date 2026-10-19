import { expect, mock, test } from "bun:test";
import type { Repo } from "../utils/repo";

const NEW: Repo = { baseUrl: "https://new", name: "New", signingKey: "k" };

// The persistence plugin needs a device; the store only needs it to exist.
mock.module("@/state/observable-persist", () => ({
  ObservablePersist: class {
    getTable = () => undefined;
    getMetadata = () => undefined;
    set = () => {};
    setMetadata = () => {};
    deleteTable = () => {};
    deleteMetadata = () => {};
  },
}));

const { addRepo, removeRepo, repos$ } = await import("./repos");

test("starts with no repository", () => {
  expect(repos$.get()).toEqual([]);
});

test("addRepo replaces the array so subscribers see the change", () => {
  const before = repos$.get();
  addRepo(NEW);
  const after = repos$.get();

  expect(after).not.toBe(before);
  expect(after.map((r) => r.baseUrl)).toContain(NEW.baseUrl);
});

test("addRepo ignores a repo already added", () => {
  const before = repos$.get();
  addRepo(NEW);

  expect(repos$.get()).toBe(before);
});

test("removeRepo drops the repo by baseUrl", () => {
  removeRepo(NEW.baseUrl);

  expect(repos$.get().some((r) => r.baseUrl === NEW.baseUrl)).toBe(false);
});
