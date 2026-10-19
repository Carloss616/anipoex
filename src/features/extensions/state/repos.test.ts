import { expect, mock, test } from "bun:test";
import type { Repo } from "../utils/repo";

const NEW: Repo = {
  baseUrl: "https://new",
  name: "New",
  signingKey: "k",
  indexUrl: "https://new/index.pb",
  legacy: false,
};

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

const { addRepo, removeRepo, repos$, storedRepo } = await import("./repos");

test("starts with no repository", () => {
  expect(repos$.get()).toEqual([]);
});

test("addRepo replaces the array so subscribers see the change", () => {
  const before = repos$.get();
  addRepo(NEW);
  const after = repos$.get();

  expect(after).not.toBe(before);
  expect(after.map((r) => r.indexUrl)).toContain(NEW.indexUrl);
});

test("addRepo ignores a repo already added", () => {
  const before = repos$.get();
  addRepo(NEW);

  expect(repos$.get()).toBe(before);
});

test("removeRepo drops the repo by index address", () => {
  removeRepo(NEW.indexUrl);

  expect(repos$.get()).toEqual([]);
});

test("two stores in one folder are two repos and removing one keeps the other", () => {
  const second = { ...NEW, name: "Second", indexUrl: "https://new/other.pb" };
  addRepo(NEW);
  addRepo(second);
  expect(repos$.get().map((r) => r.indexUrl)).toEqual([
    NEW.indexUrl,
    second.indexUrl,
  ]);

  removeRepo(NEW.indexUrl);
  expect(repos$.get()).toEqual([second]);
  removeRepo(second.indexUrl);
});

test("a repo saved before index urls existed reads as legacy", () => {
  const old = { baseUrl: "https://old", name: "Old", signingKey: "k" };
  expect(storedRepo(old)).toEqual({
    ...old,
    indexUrl: "https://old/repo.json",
    legacy: true,
  });
  expect(storedRepo(NEW)).toEqual(NEW);
});
